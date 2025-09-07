'use client';
import * as React from 'react';
import { Progress } from '@/components/ui/progress';

export function Loader() {
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    window.addEventListener('beforeunload', handleStart);
    window.addEventListener('load', handleComplete);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleComplete);
    };
  }, []);

  return isLoading ? <Progress value={100} className="w-[10%]" /> : null;
}
