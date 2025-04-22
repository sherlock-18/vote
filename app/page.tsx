"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VoteIcon } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-white transform -skew-y-3 origin-left -translate-y-10"></div>
      
      <div className="container mx-auto px-4 py-8 z-10 flex-1 flex flex-col">
        <header className="py-4">
          <div className="text-white text-2xl font-bold flex items-center">
            <VoteIcon className="mr-2 h-6 w-6" />
            Vote Now
          </div>
        </header>
        
        <main className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 py-12">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              VOTE NOW
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-90 mb-8">
              LET YOUR VOICE BE HEARD!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-full"
                onClick={() => router.push("/signup")}
              >
                USER SIGN-UP/LOGIN
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
                onClick={() => router.push("/admin/login")}
              >
                ADMIN-LOGIN
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Digital Voting" 
              className="w-full max-w-md rounded-lg shadow-xl"
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
}