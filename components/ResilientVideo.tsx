import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  ariaHidden?: boolean;
  // If true, don't attach the source until the element is visible (saves bandwidth)
  deferLoad?: boolean;
};

export default function ResilientVideo({
  src,
  poster,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  ariaHidden = true,
  deferLoad = false,
}: Props) {
  const [ok, setOk] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(!deferLoad);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Reset when src changes
    setOk(true);
    setShouldLoad(!deferLoad);
  }, [src, deferLoad]);

  useEffect(() => {
    if (!deferLoad || shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver to start loading when visible
    let obs: IntersectionObserver | null = null;
    try {
      obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            obs?.disconnect();
            obs = null;
          }
        });
      });
      obs.observe(el);
    } catch (e) {
      // Fallback: if IO not supported, load after small delay
      const id = window.setTimeout(() => setShouldLoad(true), 250);
      return () => window.clearTimeout(id);
    }

    return () => {
      obs?.disconnect();
      obs = null;
    };
  }, [deferLoad, shouldLoad]);

  // If the video errors (missing file, blocked, etc), hide it and rely on poster
  const handleError = () => setOk(false);

  // Some browsers may not fire error for <source>; listen for canplaythrough to confirm
  const handleCanPlay = () => setOk(true);

  return (
    <>
      {ok ? (
        <video
          ref={ref}
          className={className}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          poster={poster}
          onError={handleError}
          onCanPlayThrough={handleCanPlay}
        >
          {shouldLoad && <source src={src} type="video/mp4" />}
        </video>
      ) : (
        // Fallback: poster as background image, preserves sizing via className
        <div
          aria-hidden={ariaHidden}
          className={className}
          style={{
            backgroundImage: poster ? `url(${poster})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
    </>
  );
}
