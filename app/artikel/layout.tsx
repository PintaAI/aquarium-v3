import Navbar from '@/components/navbar';
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default layout;
