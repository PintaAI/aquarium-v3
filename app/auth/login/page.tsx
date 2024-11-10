"use client"
import React from 'react';
import { motion } from 'framer-motion';
import AuthCard from '@/app/components/AuthCard';


export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/30 via-background to-secondary/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AuthCard mode="login" />
      </motion.div>
    </div>
  );
}