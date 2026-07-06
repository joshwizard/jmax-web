import { MessageCircle } from "lucide-react";

const WA_NUMBER = "254702067939";
const WA_TEXT = encodeURIComponent("Hi Jmax Builders, I'd like to discuss a project.");

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Jmax Builders on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-4 ring-[#25D366]/20 transition hover:scale-105 hover:ring-8"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
