// components/ShaderBackground.tsx
"use client";

import React, { useEffect, useRef } from "react";

/**
 * Minimal WebGPU shader background component.
 * Renders a fullscreen shader that receives:
 *  - time (seconds)
 *  - resolution (width, height)
 *  - mouse (x, y) in pixels, -1,-1 when not present
 *
 * Drop this in your layout as:
 * <ShaderBackground className="absolute inset-0 -z-10" />
 *
 * Note: Some browsers require enabling WebGPU flags. Provide fallback via CSS.
 */

type Props = {
  className?: string;
};

export default function ShaderBackground({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const deviceRef = useRef<GPUDevice | null>(null);
  const uniformBufferRef = useRef<GPUBuffer | null>(null);
  const pipelineRef = useRef<GPURenderPipeline | null>(null);
  const contextRef = useRef<GPUCanvasContext | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!("gpu" in navigator)) {
        // WebGPU not supported. Do nothing — CSS fallback will show.
        return;
      }
      const canvas = canvasRef.current!;
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) return;
      const device: GPUDevice = await adapter.requestDevice();
      deviceRef.current = device;

      // Configure context
      const context = canvas.getContext("webgpu") as GPUCanvasContext | null;
      if (!context) return;
      contextRef.current = context;

      const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
      function resizeCanvasToDisplaySize() {
        const width = Math.floor(canvas.clientWidth * devicePixelRatio);
        const height = Math.floor(canvas.clientHeight * devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
      resizeCanvasToDisplaySize();

      const format = navigator.gpu.getPreferredCanvasFormat();

      context.configure({
        device,
        format,
        alphaMode: "premultiplied", // use premultiplied for correct blending with dark bg
      });

      // Create uniform buffer (time, resolution.x, resolution.y, mouse.x, mouse.y)
      const uniformBufferSize = 5 * 4; // 5 floats (4 bytes each) = 20 bytes
      const uniformBuffer = device.createBuffer({
        size: 64, // padded to 64 bytes for alignment safety
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      uniformBufferRef.current = uniformBuffer;

      // Simple vertex shader: fullscreen triangle (verts generated in shader)
      // Fragment shader: a simple moving gradient using time and mouse
      const shaderModule = device.createShaderModule({
        code: `
struct Uniforms {
  time : f32,
  resX : f32,
  resY : f32,
  mouseX : f32,
  mouseY : f32,
};

@binding(0) @group(0) var<uniform> u : Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vertex_index : u32) -> @builtin(position) vec4<f32> {
  // Fullscreen triangle (no vertex buffer)
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );
  let p = pos[vertex_index];
  return vec4<f32>(p, 0.0, 1.0);
}

fn palette(t: f32) -> vec3<f32> {
  // a smooth palette function
  let a = vec3<f32>(0.5, 0.5, 0.5);
  let b = vec3<f32>(0.5, 0.5, 0.5);
  let c = vec3<f32>(1.0, 1.0, 1.0);
  let d = vec3<f32>(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

@fragment
fn fs_main(@builtin(position) fragCoord : vec4<f32>) -> @location(0) vec4<f32> {
  let uv = fragCoord.xy / vec2<f32>(u.resX, u.resY);
  // center and aspect-corrected coords
  let aspect = u.resX / u.resY;
  var p = (uv - vec2<f32>(0.5, 0.5));
  p.x *= aspect;

  // animated radius & angle
  let t = u.time;
  let r = length(p);
  let a = atan2(p.y, p.x);

  // moving bands
  let v = 0.5 + 0.5 * cos(6.0 * r - t * 1.5 + a * 2.0);

  // mix with mouse influence
  let mx = (u.mouseX * 2.0 - u.resX) / u.resX;
  let my = (u.mouseY * 2.0 - u.resY) / u.resY;
  let md = length(vec2<f32>(mx, my));
  let mixv = mix(v, 0.6 + 0.4 * (1.0 - md), 0.25);

  let col = palette(mixv + 0.2 * sin(t * 0.7));
  // darken towards edges
  let fade = smoothstep(0.9, 0.4, r);
  col *= fade;

  return vec4<f32>(col, 1.0);
}
        `,
      });

      // pipeline
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main",
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: "none",
        },
      });
      pipelineRef.current = pipeline;

      // bind group
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
            },
          },
        ],
      });

      // pointer/mouse state
      let mouseX = -1;
      let mouseY = -1;
      function onPointerMove(e: PointerEvent) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * devicePixelRatio;
        mouseY = (e.clientY - rect.top) * devicePixelRatio;
      }
      function onPointerLeave() {
        mouseX = -1;
        mouseY = -1;
      }
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);

      // resize handling
      function handleResize() {
        resizeCanvasToDisplaySize();
        context.configure({ device, format, alphaMode: "premultiplied" });
      }
      window.addEventListener("resize", handleResize);

      // animation loop
      let start = performance.now();
      function frame(now: number) {
        if (!mounted) return;
        // ensure canvas size matches display size
        resizeCanvasToDisplaySize();

        const elapsed = (now - start) / 1000;
        // write uniforms (time, resX, resY, mouseX, mouseY)
        const resX = canvas.width;
        const resY = canvas.height;

        // create a Float32Array view with 5 floats; we'll copy to the GPU
        const data = new Float32Array([elapsed, resX, resY, mouseX, mouseY]);
        device.queue.writeBuffer(uniformBuffer, 0, data.buffer, data.byteOffset, data.byteLength);

        // render pass
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const passEncoder = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });

        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(3, 1, 0, 0); // full-screen triangle
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        animationRef.current = requestAnimationFrame(frame);
      }

      animationRef.current = requestAnimationFrame(frame);

      // cleanup
      const cleanup = () => {
        mounted = false;
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        // device destroy is currently not standardized everywhere; best-effort
        // @ts-ignore
        if (device && (device as any).destroy) {
          // @ts-ignore
          (device as any).destroy();
        }
      };

      // store cleanup on ref so effect cleanup can call it
      (canvas as any).__wg_cleanup = cleanup;
    }

    init();

    return () => {
      mounted = false;
      const canvas = canvasRef.current;
      if (canvas && (canvas as any).__wg_cleanup) {
        (canvas as any).__wg_cleanup();
        delete (canvas as any).__wg_cleanup;
      }
    };
  }, []);

  // Render canvas. Also include a CSS fallback background in case WebGPU is not supported.
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ backgroundColor: "black" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          // Use will-change to hint compositor; keep pointer-events none so UI can be interacted with
          willChange: "transform",
        }}
      />
    </div>
  );
}
