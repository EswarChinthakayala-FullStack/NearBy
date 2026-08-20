import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FAQItem[] = [
    {
      question: 'How does Nearby AI generate personalized trip itineraries?',
      answer: 'Nearby AI processes natural language queries alongside live vector map data, opening hours, crowd metrics, and user preferences to build minute-by-minute travel routes tailored to your pace.',
    },
    {
      question: 'Can I use Nearby offline without an internet connection?',
      answer: 'Yes! Nearby enables regional map pack downloads so vector tiles, place details, emergency contacts, and GPS turn-by-turn navigation remain fully functional offline.',
    },
    {
      question: 'Are the place ratings and reviews verified?',
      answer: 'Every review on Nearby is verified using GPS location logs and timestamp validation to prevent fake reviews and ensure authentic recommendations.',
    },
    {
      question: 'Is my personal location data tracked or shared with third parties?',
      answer: 'No. Your location privacy is guaranteed. GPS coordinates are processed locally on your device or ephemerally during active search queries without being sold or stored permanently.',
    },
    {
      question: 'Does Nearby support custom budget and dietary filters?',
      answer: 'Absolutely. You can specify budget constraints (e.g. under ₹1000/day) or dietary preferences (e.g. vegan Goan curries) directly in your natural language search prompts.',
    },
  ]

  return (
    <section id="faq" className="py-24 border-t border-border bg-card/30 relative">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        
        <div className="text-center space-y-4">
          <Badge variant="accent" className="gap-1 px-3 py-1">
            <Icon name="profile" size="xs" /> Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Everything You Need to Know About Nearby
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Got questions? We've got answers. Explore how Nearby powers your travel intelligence.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="rounded-sm border border-border bg-card overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  <Icon
                    name="arrow-right"
                    size="xs"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-90 text-primary' : 'text-muted-foreground'}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="px-5 pb-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
