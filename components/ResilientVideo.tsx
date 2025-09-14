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
}: Props) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Reset when src changes
    setOk(true);
  }, [src]);

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
          <source src={src} type="video/mp4" />
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
