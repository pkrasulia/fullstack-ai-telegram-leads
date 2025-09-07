import React, { ReactNode } from 'react';
import { Navbar } from '@/components/home/Navbar';

interface PanelLayoutProps {
  children: ReactNode;
}

export default function layout({ children }: PanelLayoutProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
