'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Preloader from './Preloader';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && <Preloader />}
      {children}
    </>
  );
};

export default PageWrapper;
