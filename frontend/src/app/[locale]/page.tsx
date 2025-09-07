import { useTranslations } from 'next-intl';
import { About } from '@/components/home/About';
import { Cta } from '@/components/home/Cta';
import { FAQ } from '@/components/home/FAQ';
import { Features } from '@/components/home/Features';
import { Footer } from '@/components/home/Footer';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Navbar } from '@/components/home/Navbar';
import { Newsletter } from '@/components/home/Newsletter';
import { Pricing } from '@/components/home/Pricing';
import { ScrollToTop } from '@/components/home/ScrollToTop';
import { Services } from '@/components/home/Services';
import { Testimonials } from '@/components/home/Testimonials';

export default function Home() {
  const t = useTranslations('home');

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Services />
      <Cta />
      <Testimonials />
      <Newsletter />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}
