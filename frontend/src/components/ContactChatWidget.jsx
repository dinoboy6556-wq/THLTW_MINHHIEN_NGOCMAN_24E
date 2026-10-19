"use client";

import { useEffect, useRef, useState } from "react";

function ChatMark() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 w-6 rounded-lg border-2 border-current after:absolute after:-bottom-1 after:left-1 after:h-2 after:w-2 after:rotate-[-35deg] after:border-b-2 after:border-l-2 after:border-current after:bg-teal-700"
    >
      <span className="absolute inset-0 flex items-center justify-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
    </span>
  );
}

export default function ContactChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event) => {
      if (!widgetRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3"
    >
      {isOpen && (
        <section
          id="myshop-contact-panel"
          aria-label="Liên hệ MyShop"
          className="w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center gap-3 bg-teal-700 px-4 py-3 text-white">
            <ChatMark />
            <div>
              <h2 className="text-sm font-semibold">Liên hệ MyShop</h2>
              <p className="text-xs text-teal-100">Chúng tôi sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <div className="space-y-2 p-3">
            <a
              href="mailto:support@myshop.com"
              className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition hover:border-teal-600 hover:bg-teal-50"
            >
              <span>Email hỗ trợ</span>
              <span className="text-xs text-slate-500">support@myshop.com</span>
            </a>
            <a
              href="tel:19001234"
              className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition hover:border-teal-600 hover:bg-teal-50"
            >
              <span>Gọi hotline</span>
              <span className="text-xs text-slate-500">1900 1234</span>
            </a>
          </div>
        </section>
      )}

      <button
        type="button"
        title="Liên hệ MyShop"
        aria-label={isOpen ? "Đóng liên hệ MyShop" : "Mở liên hệ MyShop"}
        aria-controls="myshop-contact-panel"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      >
        <ChatMark />
      </button>
    </div>
  );
}