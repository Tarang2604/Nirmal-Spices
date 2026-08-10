import React from 'react';

export default function AnnouncementBar() {
  const announcements = [
    "🌶️ FREE DELIVERY on orders above ₹499",
    "📞 Customer Support: +91 9770057005",
    "⭐ 58+ Varieties of Authentic Indian Spices",
    "🏭 Processed hygienically in Harda, MP",
    "🍃 100% Pure, Organic & Zero Additives"
  ];

  return (
    <div className="bg-crimson text-cream h-[28px] text-[11px] overflow-hidden w-full select-none sticky top-0 z-50 flex items-center" role="banner">
      <div className="max-w-7xl mx-auto px-4 overflow-hidden relative w-full">
        <div className="announcement-ticker flex items-center gap-12 font-sans font-semibold uppercase tracking-widest">
          {/* Double array to make the infinite loop continuous */}
          {[...announcements, ...announcements].map((text, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 whitespace-nowrap">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
