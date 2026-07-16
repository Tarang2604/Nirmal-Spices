"use client";

import React, { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '919770057005';
const WHATSAPP_MESSAGE = "Hello! I'm interested in your spices.";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  // Show button after slight delay for a smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide tooltip after 4s
  useEffect(() => {
    if (tooltip) {
      const t = setTimeout(() => setTooltip(false), 4000);
      return () => clearTimeout(t);
    }
  }, [tooltip]);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label="Contact us on WhatsApp"
    >
      {/* Tooltip bubble */}
      <div
        className={`
          bg-white text-charcoal text-xs font-sans font-semibold px-3 py-2 rounded-xl shadow-lg border border-green-100
          transition-all duration-300 whitespace-nowrap
          ${tooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
        `}
        role="tooltip"
      >
        💬 Chat with us on WhatsApp!
      </div>

      {/* Main WhatsApp button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setTooltip(false)}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-2xl
          bg-[#25D366] hover:bg-[#20BD5C] active:scale-95
          transition-all duration-500 ease-out
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'}
        `}
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.987.82 5.78 2.246 8.172L.5 31.5l7.536-2.21A15.464 15.464 0 0 0 16 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5zm0 28.5a13.014 13.014 0 0 1-6.624-1.802l-.475-.282-4.938 1.447 1.476-4.808-.31-.494A13 13 0 1 1 16 29zm7.17-9.726c-.393-.196-2.325-1.147-2.686-1.277-.361-.131-.624-.196-.887.196s-1.018 1.277-1.247 1.54-.459.294-.852.098c-.393-.196-1.66-.612-3.162-1.951-1.169-1.042-1.958-2.329-2.188-2.722-.229-.393-.024-.605.172-.8.177-.175.393-.459.59-.688.196-.229.262-.393.393-.655.131-.262.066-.491-.033-.688-.098-.196-.887-2.138-1.215-2.927-.32-.77-.645-.665-.887-.677-.229-.01-.491-.013-.754-.013s-.688.098-1.049.491c-.361.393-1.38 1.348-1.38 3.288s1.413 3.815 1.61 4.077c.196.262 2.781 4.247 6.738 5.956.941.406 1.675.648 2.246.83.944.3 1.803.257 2.482.156.757-.113 2.325-.951 2.654-1.869.328-.919.328-1.706.229-1.869-.098-.164-.361-.262-.754-.458z" />
        </svg>
      </a>

      {/* Pulse ring animation */}
      <span
        className={`
          absolute bottom-0 right-0 w-14 h-14 rounded-full bg-[#25D366] opacity-30 animate-ping
          ${visible ? 'block' : 'hidden'}
        `}
        aria-hidden="true"
      />
    </div>
  );
}
