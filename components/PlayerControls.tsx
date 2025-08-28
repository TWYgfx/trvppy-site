// components/PlayerControls.tsx
/* eslint-disable @next/next/no-img-element */
import { usePlayer } from "../context/PlayerContext";

export default function PlayerControls() {
  const {
    ready,
    errorMsg,
    isPlaying,
    title,
    thumb,
    muted,
    volume,
    prev,
    next,
    togglePlay,
    toggleMute,
    setVolume,
  } = usePlayer();

  return (
    <div className="w-[200px] md:w-[360px] px-1 py-1 select-none">
      {/* Row 1: cover + title (title is truncated so width is stable) */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 overflow-hidden rounded-lg shrink-0">
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/60">
              TRVPPY
            </div>
          )}
        </div>
        <div className="truncate text-xs text-white/90" aria-live="polite">
          {errorMsg ? errorMsg : ready ? title || "—" : "Loading…"}
        </div>
      </div>

      {/* Row 2: transport + volume (volume hidden on mobile) */}
      <div className="mt-1 flex items-center gap-1">
        <button
          onClick={prev}
          className="p-1 hover:opacity-80"
          disabled={!ready || !!errorMsg}
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zM20 6v12l-10-6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="p-1 rounded-full bg-white text-black hover:opacity-90 active:scale-95"
          disabled={!ready || !!errorMsg}
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={next}
          className="p-1 hover:opacity-80"
          disabled={!ready || !!errorMsg}
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6v12l-10-6zM18 6h2v12h-2z" />
          </svg>
        </button>

        <button
          onClick={toggleMute}
          className="p-1 hover:opacity-80"
          disabled={!ready || !!errorMsg}
          aria-label={muted ? "Unmute" : "Mute"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12a4.5 4.5 0 00-4.5-4.5v-3a7.5 7.5 0 017.5 7.5h-3zM4 9v6h4l5 5V4L8 9H4zm12.5 3l3 3 1.5-1.5L18.5 10.5 17 12z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 3.23v17.54c3.39-.49 6-3.39 6-6.77s-2.61-6.28-6-6.77zM3 9v6h4l5 5V4L7 9H3z" />
            </svg>
          )}
        </button>

        {/* Hide volume on small screens */}
        <input
          aria-label="Volume"
          type="range"
          min={0}
          max={100}
          step={1}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
          className="ml-1 hidden sm:block w-[90px] md:w-[140px] accent-white"
          disabled={!ready || !!errorMsg}
        />
      </div>
    </div>
  );
}
