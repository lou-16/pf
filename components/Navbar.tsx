"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
}

const navItems = [
  { name: "Home", section: 0 },
  { name: "Projects", section: 1 },
  { name: "Contact", section: 2 },
]

export default function Navbar({ currentSection, onSectionChange }: NavbarProps) {
  const isLightBackground = currentSection === 1; // Projects section has white background

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-2",
          isLightBackground 
            ? "bg-black/30 border-black/20" 
            : "bg-white/30 border-white/10",
          "backdrop-blur-xl",
          "shadow-lg shadow-black/5"
        )}
      >
        {navItems.map((item) => (
          <NavItem 
            key={item.name} 
            {...item} 
            isActive={currentSection === item.section}
            onClick={() => onSectionChange(item.section)}
            isLightBackground={isLightBackground}
          />
        ))}
      </div>
    </motion.nav>
  )
}

function NavItem({ 
  name, 
  section, 
  isActive, 
  onClick,
  isLightBackground 
}: { 
  name: string; 
  section: number;
  isActive: boolean;
  onClick: () => void;
  isLightBackground: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <button
        onClick={onClick}
        className={cn(
          "relative rounded-full px-4 py-2 text-sm font-medium",
          "transition-colors",
          isLightBackground 
            ? isActive 
              ? "bg-black/20 text-black" 
              : "text-black/70 hover:text-black"
            : isActive 
              ? "bg-white/20 text-white" 
              : "text-white/70 hover:text-white"
        )}
      >
        {name}
      </button>
    </motion.div>
  )
}
