import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemProps {
  id: string;
  number: string;
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItemProps[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="faq-wrap space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="faq-item border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              className="faq-trigger flex w-full items-center justify-between py-6 text-left font-extrabold text-slate-900 dark:text-slate-100"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center">
                <span className="mr-5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {item.number}
                </span>
                <span className="text-base sm:text-lg">{item.question}</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-600" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="faq-content pb-6 pl-9 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
