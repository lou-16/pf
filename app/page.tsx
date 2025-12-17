"use client"

import Profile from "@/components/Profile";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling.current) return;
      
      const delta = e.deltaY;
      
      if (delta > 0 && currentSection < 2) {
        // Scroll down
        isScrolling.current = true;
        setCurrentSection(prev => prev + 1);
        setTimeout(() => { isScrolling.current = false; }, 1000);
      } else if (delta < 0 && currentSection > 0) {
        // Scroll up
        isScrolling.current = true;
        setCurrentSection(prev => prev - 1);
        setTimeout(() => { isScrolling.current = false; }, 1000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentSection]);

  return (
    <div 
      ref={containerRef}
      className="bg-black font-sans text-white h-screen overflow-hidden"
    >
      {/* Navbar */}
      <Navbar currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      <motion.div
        animate={{ y: `${-currentSection * 100}vh` }}
        transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="w-full"
      >
        {/* Profile Section - Full Screen */}
        <section className="h-screen flex items-center justify-center bg-black relative">
          <Profile />
          {/* Gradient transition at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-b from-transparent to-white/10 pointer-events-none" />
        </section>
        
        {/* Projects Section - White Background */}
        <section className="h-screen bg-linear-to-b from-gray-100 to-white relative">
          {/* Gradient transition at top */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/10 to-transparent pointer-events-none z-20" />
          <ProjectsSection />
        </section>

        {/* Contact Section - Black Background */}
        <section className="h-screen bg-black relative">
          <ContactSection />
        </section>
      </motion.div>

      {/* Section indicators */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSection === index ? 'bg-white scale-125' : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
