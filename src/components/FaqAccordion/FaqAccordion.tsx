import { useState, type ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/cn'

export interface FaqAccordionItem {
  question: ReactNode
  answer: ReactNode
}

export interface FaqAccordionProps {
  items: FaqAccordionItem[]
  className?: string
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `faq-panel-${index}`
        const headerId = `faq-header-${index}`
        return (
          <div key={index} className="overflow-hidden rounded-[18px] border border-border bg-white">
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-[17px] font-medium text-ink">{item.question}</span>
              <CaretDownIcon
                weight="bold"
                className={cn(
                  'h-5 w-5 shrink-0 text-coral-500 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-6 pb-5 font-body text-[15.5px] leading-relaxed text-slate">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
