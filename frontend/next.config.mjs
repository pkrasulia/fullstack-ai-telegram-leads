import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Настройте игнорирование линтера для указанных файлов или директорий
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
