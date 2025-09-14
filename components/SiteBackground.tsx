export default function SiteBackground() {
  const src = process.env.NEXT_PUBLIC_BG_VIDEO;

  return (
    <div
      id="bg-root"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}           // sits behind your content
      aria-hidden
    >
      <video
        id="bg-video"
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        // controls                      // <- uncomment while testing
        onError={(e) => console.error("Background video error", e)}
      >
        {src && <source src={src} type="video/mp4" />}
      </video>

      {/* dimmer so UI stays readable; change to /30 or remove if too dark */}
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}
