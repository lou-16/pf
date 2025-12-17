"use client"

import Image from 'next/image'
import VertBar from './VertBar';
import { motion } from 'motion/react'
import Typewriter from './Typewriter';
import GitAndThings from './GitAndThings';

const MyInfoCard = () => {
    return (
    <div 
     className='items-center pt-4 md:pt-8 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-6xl px-4'
    >
        <Typewriter />
        
        {/* the github / profile pic box */}
        <div className="w-full md:w-auto border border-white rounded-2xl h-64 md:h-96 items-center justify-center flex flex-col p-4">
            <GitAndThings />
        </div>

    </div>)
}

export default MyInfoCard;