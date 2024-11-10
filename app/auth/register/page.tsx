"use client"
import React from 'react';
import { motion } from 'framer-motion';

import { Book, Users, Briefcase, Globe } from 'lucide-react';
import AuthCard from '@/components/form/AuthCard';

const WebsiteInfo = () => (
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="bg-gradient-to-br from-secondary/10 to-primary/10 p-4 md:p-8 rounded-lg shadow-lg backdrop-blur-sm"
>
  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
    Temukan Peluang di Korea
  </h2>
  <p className="text-foreground text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
    Buka pintu kesempatan untuk bekerja dan tinggal di Korea. Kami menyediakan kursus bahasa Korea, komunitas supportif, dan panduan kerja lengkap untuk membantu Anda mencapai impian.
  </p>
  <div className="space-y-4 md:space-y-6">
    <FeatureItem 
      icon={<Book className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
      title="Kursus Bahasa Korea"
      description="Pelajari bahasa Korea dari dasar hingga mahir dengan instruktur berpengalaman."
    />
    <FeatureItem 
      icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
      title="Komunitas Supportif"
      description="Bergabung dengan ribuan pejuang Indonesia lainnya yang bekerja dan tinggal di Korea."
    />
    <FeatureItem 
      icon={<Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
      title="Panduan Kerja"
      description="Dapatkan informasi lengkap tentang cara mendapatkan pekerjaan dan izin tinggal di Korea."
    />
    <FeatureItem 
      icon={<Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
      title="Wawasan Budaya"
      description="Pelajari budaya Korea untuk memudahkan adaptasi Anda di lingkungan baru."
    />
  </div>
</motion.div>

);

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4">
    {icon}
    <div>
      <h3 className="text-xl font-semibold text-foreground/90 dark:text-foreground/80 mb-1">{title}</h3>
      <p className="text-foreground/70 dark:text-foreground/60">{description}</p>
    </div>
  </div>
);

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/30 via-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl pt-16 flex flex-col md:flex-row gap-8">
      <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2"
        >
          <AuthCard mode="register" />
        </motion.div>
      <div className="w-full md:w-1/2">
          <WebsiteInfo />
        </div>

      </div>
    </div>
  );
}