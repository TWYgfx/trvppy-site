// context/PlayerContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type YTState = -1 | 0 | 1 | 2 | 3 | 5;

type Ctx = {
  ready: boolean;
  errorMsg: string;
  isPlaying: boolean;
  title: string;
  thumb: string;
  muted: boolean;
  volume: number;
  prev: () => void;
  next: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
};

const PlayerCtx = createContext<Ctx | null>(null);

const PLAYLIST_ID = "PLlHa5vwuOS3_K1KBqfo7sTtz3LrPRjHqC"; // your playlist

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const hiddenMount = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const wasPlayingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<YTState>(-1);
  const [muted, setMuted] = useState(false);
  const [volume, setVol] = useState(60);
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const thumb = useMemo(
    () => (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""),
    [videoId]
  );

  // Load IFrame API once
  useEffect(() => {
    let destroyed = false;

    const ensureAPI = () =>
      new Promise<void>((resolve) => {
        if (typeof window === "undefined") return resolve();
        if (window.YT && window.YT.Player) return resolve();
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        window.onYouTubeIframeAPIReady = () => resolve();
        document.head.appendChild(tag);
      });

    (async () => {
      setErrorMsg("");
      await ensureAPI();
      if (destroyed || !hiddenMount.current) return;

      playerRef.current = new window.YT.Player(hiddenMount.current, {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.cuePlaylist({ listType: "playlist", list: PLAYLIST_ID, index: 0 });
              e.target.setVolume(volume);
              setMuted(e.target.isMuted());
              setReady(true);
              const d = e.target.getVideoData();
              setTitle(d?.title ?? "");
              setVideoId(d?.video_id ?? "");
            } catch {
              setErrorMsg("Couldn’t load playlist.");
            }
          },
          onStateChange: (e: any) => {
            setState(e.data as YTState);
            const playing = e.data === window.YT.PlayerState.PLAYING || e.data === window.YT.PlayerState.BUFFERING;
            wasPlayingRef.current = playing;
            try {
              const d = e.target.getVideoData();
              setTitle(d?.title ?? "");
              setVideoId(d?.video_id ?? "");
            } catch {}
          },
          onError: () => setErrorMsg("YouTube error"),
        },
      });
    })();

    return () => {
      destroyed = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      setReady(false);
    };
  }, []);

  // Volume changes should NOT pause; resume if it accidentally does
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    const p = playerRef.current;
    try {
      p.setVolume(volume);
      if (volume === 0 && !p.isMuted()) p.mute();
      if (volume > 0 && p.isMuted()) p.unMute();
      setMuted(p.isMuted());
      // if it was playing before the change, keep it playing
      if (wasPlayingRef.current) p.playVideo();
    } catch {}
  }, [volume, ready]);

  const isPlaying =
    typeof window !== "undefined" &&
    window.YT &&
    state === window.YT.PlayerState.PLAYING;

  const P = () => (ready ? playerRef.current : null);

  const togglePlay = () => {
    const p = P();
    if (!p) return;
    const s = p.getPlayerState();
    s === window.YT.PlayerState.PLAYING ? p.pauseVideo() : p.playVideo();
  };
  const toggleMute = () => {
    const p = P();
    if (!p) return;
    p.isMuted() ? (p.unMute(), setMuted(false)) : (p.mute(), setMuted(true));
  };
  const prev = () => P()?.previousVideo();
  const next = () => P()?.nextVideo();
  const setVolume = (v: number) => setVol(v);

  const value: Ctx = {
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
  };

  return (
    <PlayerCtx.Provider value={value}>
      {children}
      {/* Hidden engine stays mounted across pages */}
      <div ref={hiddenMount} className="hidden" />
    </PlayerCtx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
