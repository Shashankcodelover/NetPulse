'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <motion.span
            className="absolute h-full w-full rounded-full border-4 border-blue-500/20 border-t-blue-500"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        <motion.p 
          className="text-sm font-medium text-gray-500 text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Loading system resources...
        </motion.p>
      </div>
    </div>
  );
}
