'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

export const FAQ = () => {
  const t = useTranslations('home.faq');

  const FAQList: FAQProps[] = [
    {
      question: t('questions.0.title'),
      answer: t('questions.0.description'),
      value: 'item-1',
    },
    {
      question: t('questions.1.title'),
      answer: t('questions.1.description'),
      value: 'item-2',
    },
    {
      question: t('questions.2.title'),
      answer: t('questions.2.description'),
      value: 'item-3',
    },
  ];

  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        {t('title')}{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {t('titleAccent')}
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full AccordionRoot">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        {t('still_questions')}{' '}
        <a
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          {t('write_to_us')}
        </a>
      </h3>
    </section>
  );
};
