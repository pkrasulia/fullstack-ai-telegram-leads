'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        <p className="mt-4 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default Preloader;
