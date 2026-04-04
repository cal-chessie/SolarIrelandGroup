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
      'A typical residential solar PV system costs between €4,500 and €7,500 before the SEAI grant. After the €1,800 grant, you are looking at approximately €2,700 to €5,700 out of pocket. The exact cost depends on the system size, the complexity of your roof, whether you want a battery, and other factors. We provide itemised quotes so you can see exactly where your money goes.',
  },
  {
    question: 'How long does the installation take?',
    answer:
      'The physical installation is usually completed within one day for a standard residential system. The scaffolding goes up first thing in the morning, the panels are mounted and wired during the day, and the system is commissioned before we leave. The SEAI grant application and BER assessment process adds some additional time, but we handle all of that on your behalf.',
  },
  {
    question: 'Will solar panels work on my roof?',
    answer:
      'Solar panels work best on south-facing roofs with a pitch between 30 and 40 degrees, but they also perform well on east or west-facing roofs. We carry out a thorough assessment during the free survey to determine if your roof is suitable, including checking for shading from trees or neighbouring buildings. Even partially shaded roofs can often accommodate a worthwhile system.',
  },
  {
    question: 'Do I need planning permission?',
    answer:
      'In most cases, no. Solar panels are considered permitted development in Ireland under certain conditions: the panels must not extend more than 50cm from the roof surface, and the total area must not exceed 12 square metres or 50% of the total roof area, whichever is less. We check all of this during the survey and will let you know if there are any issues with your specific property.',
  },
  {
    question: 'What is the SEAI grant and am I eligible?',
    answer:
      'The SEAI (Sustainable Energy Authority of Ireland) offers a Solar PV grant of up to €1,800 to help with installation costs. To be eligible, you must be the owner-occupier of a home built before 2021, and the property must have a BER rating of C3 or lower (or a pre-1978 home with no BER). We verify your eligibility during the survey and submit the application on your behalf.',
  },
  {
    question: 'How much electricity will solar panels actually generate?',
    answer:
      'In Ireland, a well-positioned solar panel system generates roughly 850 to 950 kWh per kilowatt-peak (kWp) per year. So a 4 kWp system would produce around 3,400 to 3,800 kWh annually. The actual output depends on roof orientation, pitch, shading, and local weather conditions. Ireland gets less sun than southern Europe, but modern panels are efficient enough that solar is still a worthwhile investment.',
  },
  {
    question: 'What about cloudy days and winter?',
    answer:
      'Solar panels do produce less electricity on cloudy days and during winter months, but they still generate power. Ireland receives enough daylight throughout the year for solar panels to be a practical investment. A well-designed system is sized to maximise annual generation, and any shortfall is automatically covered by the grid. Many homeowners find that their summer surplus offsets the winter deficit over the course of a year.',
  },
  {
    question: 'Do solar panels require much maintenance?',
    answer:
      'Very little. Solar panels have no moving parts and are designed to last 25 to 30 years. In most cases, natural rainfall is sufficient to keep them clean. We recommend a visual inspection once a year to check for any debris or issues. The inverter may need to be replaced after about 10 to 15 years, which is a relatively small additional cost compared to the overall system.',
  },
  {
    question: 'Do you offer battery storage as well?',
    answer:
      'Yes, we can include battery storage as part of your solar installation. A battery allows you to store excess electricity generated during the day for use in the evening or at night. This increases your self-consumption rate and reduces your grid dependence further. Battery options and pricing are discussed during the survey and included in your quote if you are interested.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Honest answers to the questions we hear most often from homeowners
            considering solar.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-amber-400 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  openIndex === index
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
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
