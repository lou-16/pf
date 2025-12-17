"use client"

import ProjectsSection from "@/components/ProjectsSection";
import { motion } from 'motion/react'
export default function Projects()
{
    return (
      <motion.div
       initial={{y: 0, opacity: 0}}
       animate={{y: -20, opacity: 1}}
       transition={{type: "spring", damping: 20, stiffness: 120 }}
       className="w-full min-h-screen bg-black text-white"
      >
        <ProjectsSection />
      </motion.div>
    )

}