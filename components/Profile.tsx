"use client"
import { motion } from 'motion/react'
import MyInfoCard from './MyInfoCard';

const Profile = () => {
    return (<motion.div
     initial={{ y: -20, opacity: 0}}
     animate={{ y: 0, opacity: 1}}
     transition={{ type: "spring", stiffness: 120, damping: 20}}
     className="flex flex-col md:flex-row w-full items-center justify-center"
    >
        <MyInfoCard />
    </motion.div>
    )
}

export default Profile;