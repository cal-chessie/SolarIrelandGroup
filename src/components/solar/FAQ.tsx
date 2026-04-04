'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How much do solar panels cost in Ireland in 2026?',
    answer:
      'A typical residential solar PV system costs between €4,500 and €7,500 before the SEAI grant. After the €1,800 grant, you are looking at approximately €2,700 to €5,700 out of pocket. The exact cost depends on the system size, roof complexity, and whether you want battery storage. We provide itemised quotes so you can see exactly where your money goes.',
  },
  {
    question: 'How long does installation take?',
    answer:
      'The physical installation is usually completed within one day for a standard residential system. The scaffolding goes up first thing in the morning, the panels are mounted and wired during the day, and the system is commissioned before we leave. The SEAI grant application and BER assessment process adds some additional time, but we handle all of that on your behalf.',
  },
  {
    question: 'Will solar panels work on my roof?',
    answer:
      'Solar panels work best on south-facing roofs with a pitch between 30 and 40 degrees, but they also perform well on east or west-facing roofs. We carry out a thorough assessment during the free survey to determine if your roof is suitable, including checking for shading from trees or neighbouring buildings.',
  },
  {
    question: 'Do I need planning permission?',
    answer:
      'In most cases, no. Solar panels are considered permitted development in Ireland under certain conditions: the panels must not extend more than 50cm from the roof surface, and the total area must not exceed 12 square metres or 50% of the roof area, whichever is less. We check all of this during the survey.',
  },
  {
    question: 'What is the SEAI grant and am I eligible?',
    answer:
      'The SEAI offers a Solar PV grant of up to €1,800. To be eligible, you must be the owner-occupier of a home built before 2021, and the property must have a BER rating of C3 or lower (or be a pre-1978 home with no BER). We verify your eligibility during the survey and submit the application on your behalf.',
  },
  {
    question: 'How much electricity will I generate?',
    answer:
      'In Ireland, a well-positioned system generates roughly 850 to 950 kWh per kilowatt-peak (kWp) per year. A 4 kWp system would produce around 3,400 to 3,800 kWh annually. Actual output depends on roof orientation, pitch, shading, and local weather. Modern panels are efficient enough that solar remains a worthwhile investment even in Irish conditions.',
  },
  {
    question: 'What about cloudy days and winter?',
    answer:
      'Solar panels produce less on cloudy days and during winter, but they still generate power. Ireland receives enough daylight throughout the year for solar to be a practical investment. A well-designed system is sized to maximise annual generation, and any shortfall is automatically covered by the grid. Many homeowners find that their summer surplus offsets the winter deficit over the course of a year.',
  },
  {
    question: 'Do you offer battery storage?',
    answer:
      'Yes, we can include battery storage as part of your solar installation. A battery allows you to store excess electricity generated during the day for use in the evening or at night. This increases your self-consumption rate and reduces your grid dependence further. Battery options and pricing are discussed during the survey.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-5 sm:px-8 relative noise-bg">
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl">
            Common
            <br />
            <span className="text-gradient">questions.</span>
          </h2>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.1] transition-colors"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-200 pr-6 text-sm sm:text-base group-hover:text-white transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-amber-400/60 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
