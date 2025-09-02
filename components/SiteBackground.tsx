// components/SiteBackground.tsx
export default function SiteBackground() {
  const src = process.env.NEXT_PUBLIC_BG_VIDEO;

  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <video
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        // controls // <- uncomment while testing if you want
        onError={(e) => console.error("Background video error", e)}
      >
        {src && <source src={src} type="video/mp4" />}
      </video>

      {/* optional dimmer overlay (keep it if you want the dark vibe) */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
    </div>
  );
}
