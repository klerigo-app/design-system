import { useState, type ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

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
    <div className={clsx('flex flex-col gap-3', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `faq-panel-${index}`
        const headerId = `faq-header-${index}`
        return (
          <div key={index} className="bg-white border border-border rounded-[18px] overflow-hidden">
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display font-medium text-[17px] text-ink">{item.question}</span>
              <CaretDownIcon
                weight="bold"
                className={clsx('w-5 h-5 text-coral-500 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={clsx(
                'grid transition-[grid-template-rows] duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden min-h-0">
                <p className="font-body text-[15.5px] leading-relaxed text-slate px-6 pb-5">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
