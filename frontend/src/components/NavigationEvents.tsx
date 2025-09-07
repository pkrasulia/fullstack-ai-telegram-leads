'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams}`;
    console.log(`Navigation to ${url}`);
    // Здесь вы можете добавить любую дополнительную логику,
    // например, аналитику или пользовательские действия при навигации
  }, [pathname, searchParams]);

  return null;
}
