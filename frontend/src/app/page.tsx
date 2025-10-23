import { redirect } from 'next/navigation';
import React from 'react';
import { getTranslations } from 'next-intl/server';

export default function RootPage() {
  redirect('/en');
}
