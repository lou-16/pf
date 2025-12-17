"use client"

import { motion } from "motion/react";

export default function ContactSection() {
  const email = "your.email@example.com"; // TODO: Replace with your actual email

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-black text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-2xl text-center"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6">
          Get In Touch
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 mb-8">
          Have a question or want to work together? Feel free to reach out!
        </p>
        
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors text-lg"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          Contact Me
        </a>

        <div className="mt-8 text-gray-500 text-sm">
          {email}
        </div>
      </motion.div>
    </section>
  );
}
