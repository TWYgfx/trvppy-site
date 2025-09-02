// pages/debug-video.tsx
import { useEffect, useState } from "react";

export default function DebugVideo() {
  const bg = process.env.NEXT_PUBLIC_BG_VIDEO;
  const twy3 = process.env.NEXT_PUBLIC_TWY3_VIDEO;
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    console.log("BG env:", bg);
    console.log("TWY3 env:", twy3);
  }, [bg, twy3]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Video Debug</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>BG Video URL</h2>
        <div style={{ wordBreak: "break-all" }}>{bg || "MISSING ENV"}</div>
        {bg && <a href={bg} target="_blank" rel="noreferrer">Open BG in new tab</a>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>TWY3 Video URL</h2>
        <div style={{ wordBreak: "break-all" }}>{twy3 || "MISSING ENV"}</div>
        {twy3 && <a href={twy3} target="_blank" rel="noreferrer">Open TWY3 in new tab</a>}
      </section>

      <section>
        <h2>Inline Players (with controls)</h2>

        <div style={{ marginBottom: 16 }}>
          <h3>BG Player</h3>
          <video
            key={bg} // forces reload if URL changes
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            width="100%"
            onError={(e) => {
              console.error("BG video failed", e);
              setErr("BG video failed to load. Check console & Network tab.");
            }}
          >
            {bg && <source src={bg} type="video/mp4" />}
          </video>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3>TWY3 Player</h3>
          <video
            key={twy3}
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            width="100%"
            onError={(e) => {
              console.error("TWY3 video failed", e);
              setErr("TWY3 video failed to load. Check console & Network tab.");
            }}
          >
            {twy3 && <source src={twy3} type="video/mp4" />}
          </video>
        </div>

        {err && <div style={{ color: "red" }}>{err}</div>}
      </section>
    </div>
  );
}
