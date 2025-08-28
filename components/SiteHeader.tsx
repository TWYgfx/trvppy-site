// components/SiteHeader.tsx
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CartButton } from "./CartDrawer";
import PlayerControls from "./PlayerControls";

export default function SiteHeader() {
  return (
    <header
      className="
        sticky top-0 z-40 w-full
        bg-black/100 backdrop-blur
        border-b border-white/10
        px-3 sm:px-4 py-2
        grid grid-cols-[120px,1fr,240px] md:grid-cols-[220px,1fr,360px]
        items-center gap-2
      "
    >
     <video
  src="/mockups/TWY3.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="hidden sm:block h-10 sm:h-12 md:h-16 max-w-full w-auto object-contain"
/>

      {/* Center: brand */}
      <div className="justify-self-center">
        <Link href="/" className="inline-block">
          <img
            src="/mockups/trvppy-logo.png"
            alt="TRVPPY"
            className="h-10 sm:h-12 md:h-16 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Right: Cart + Player (fixed footprint so layout never jumps) */}
      <div className="justify-self-end w-full">
        <div className="flex items-center justify-end gap-3">
          <CartButton />
          <PlayerControls />
        </div>
      </div>
    </header>
  );
}
