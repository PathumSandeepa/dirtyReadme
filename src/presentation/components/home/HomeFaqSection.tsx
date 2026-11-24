"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import { Reveal } from "./Reveal";

const FAQ_ITEMS = [
  {
    id: "free",
    question: "Is it free?",
    answer:
      "Yes. DirtyReadme is completely free and open source under the MIT License.",
  },
  {
    id: "sign-in",
    question: "Do I need to sign in?",
    answer:
      "No. Enter any public GitHub username to start building. You only paste a temporary token when you are ready to publish.",
  },
  {
    id: "token-storage",
    question: "Where does my token go?",
    answer:
      "Your token stays in browser memory only. It never touches cookies or web storage and is cleared right after the push.",
  },
  {
    id: "token-permissions",
    question: "Which token permissions do I need?",
    answer:
      "Classic tokens need the repo scope, plus workflow if you include the scheduled update workflow. Fine grained tokens need Contents read and write, plus Workflows read and write if you include the workflow.",
  },
  {
    id: "edit-existing",
    question: "Can I edit a README I already published?",
    answer:
      "Yes. When you connect your username, DirtyReadme checks your profile repository and restores your saved setup if it finds one.",
  },
  {
    id: "creature-required",
    question: "Is the animated creature required?",
    answer:
      "No. The pixel creature is completely optional. You can turn it off or use your own uploaded image instead.",
  },
] as const;

export function HomeFaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="home-section-below px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[820px]">
        <Reveal className="flex flex-col items-center text-center">
          <p className="home-section-label">FAQ</p>
          <h2 id="faq-heading" className="home-h2 home-gradient-text mt-3">
            Quick answers.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <Reveal key={item.id} stagger={index * 50}>
                <div className="rounded-[18px] bg-[var(--home-surface-2)]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenId((prev) => (prev === item.id ? null : item.id))
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[18px] px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="text-[16px] font-semibold tracking-[-0.015em] text-white">
                      {item.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0 text-[var(--home-text-2)] transition-transform duration-200",
                        isOpen && "rotate-180 text-white"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-[14px] leading-relaxed text-[var(--home-text-2)]">
                      {item.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
