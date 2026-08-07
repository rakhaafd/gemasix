"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HighlightText } from "@/components/ui";

import faqs from "@/data/faq.json";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 md:py-16 lg:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
          
          {/* Header Section (Left Column) */}
          <div className="text-left lg:top-32">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 tracking-tight leading-tight">
              Tanya <br className="hidden lg:block" /><HighlightText color="blue" rotate="right">Jawab</HighlightText>
            </h2>
            <p className="text-white/70 text-base max-w-md font-medium leading-relaxed">
              Temukan jawaban dari pertanyaan umum seputar keanggotaan GEMASIX.
            </p>
          </div>

          {/* FAQ Accordion (Right Column) */}
          <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={cn(
                  "border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300",
                  isOpen 
                    ? "shadow-lg bg-white/10" 
                    : "shadow-sm hover:shadow-md hover:bg-white/10"
                )}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="font-bold text-white text-base pr-8 leading-snug">
                    {faq.question}
                  </span>
                  <div className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                    isOpen ? "bg-accent-yellow-500 text-primary-900" : "bg-primary-700/50 text-white group-hover:bg-primary-600/50"
                  )}>
                    {isOpen ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                  </div>
                </button>
                
                <div 
                  className={cn(
                    "grid transition-all duration-300 ease-in-out border-white/10",
                    isOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr] border-t-0"
                  )}
                >
                  <div className="overflow-hidden bg-transparent">
                    <div className="p-5 font-medium text-white/70 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

      </div>
    </section>
  );
}
