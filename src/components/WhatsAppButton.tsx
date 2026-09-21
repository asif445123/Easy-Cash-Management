"use client";

const WHATSAPP_NUMBER = "923205501173";

/** Fixed floating WhatsApp button, bottom-right, on every page. */
export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.42.687 4.68 1.877 6.6L3 29l7.09-2.334A12.44 12.44 0 0 0 16 28c6.905 0 12.5-5.596 12.5-12.5S22.905 3 16.001 3Zm7.24 17.61c-.303.854-1.502 1.564-2.463 1.77-.655.14-1.51.25-4.39-.943-3.686-1.527-6.058-5.26-6.243-5.505-.178-.245-1.5-1.995-1.5-3.807 0-1.812.949-2.7 1.286-3.07.303-.33.663-.412.884-.412.221 0 .442.002.634.012.204.01.478-.078.747.57.303.734.995 2.545 1.083 2.73.088.185.147.402.03.647-.118.245-.176.397-.352.611-.176.216-.37.481-.529.646-.176.185-.36.386-.155.756.206.37.914 1.51 1.963 2.446 1.35 1.204 2.489 1.577 2.858 1.755.37.177.586.147.802-.088.216-.235.914-1.066 1.16-1.432.245-.366.49-.303.826-.183.335.12 2.129 1.005 2.494 1.188.365.183.608.274.696.427.088.153.088.883-.216 1.738Z" />
      </svg>
    </a>
  );
}
