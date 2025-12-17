"use client";

import { motion, useAnimation } from "motion/react";
import { useEffect } from "react";

export default function Loader() {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    const loop = async () => {
      while(isMounted){
        await controls.start({
          pathLength: 0,
          opacity: 1,
          transition: { duration: 0 },
        })
      
        // 1. DRAW
        await controls.start({
          pathLength: 1,
          transition: {
            duration: 1.5,
            ease: "linear",
          },
        });

        // 2. FADE OUT
        await controls.start({
          opacity: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        });
        await controls.start({
            pathLength: 0,
            opacity: 0,
            transition: {duration: 0}
        })

        await controls.start({
            opacity: 0,
            transition: {duration: 0.2}
        })
      }
    }
    loop();
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <motion.svg width={100} height={100} viewBox="0 0 100 100">
        <motion.circle
          cx={50}
          cy={50}
          r="40"
          stroke="#8df0cc"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={controls}
        />
      </motion.svg>
    </div>
  );
}
