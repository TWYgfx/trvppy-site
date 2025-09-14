/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import ResilientVideo from "../components/ResilientVideo";

/* ================== SITE BACKGROUND (looping video) ================== */
function SiteBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <ResilientVideo
        src="https://cdn.shopify.com/videos/c/o/v/3f7b18f1efac45968db75f10d284ac1b.mp4"
        poster="/mockups/res.png"
        className="bgvid h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
    </div>
  );
}

/* ================== GLITCH SLIDESHOW ================== */
function GlitchSlideshow({
  images,
  interval = 3400,
  glitchMs = 450,
}: {
  images: string[];
  interval?: number;
  glitchMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!images?.length) return;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const id = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % images.length);
        setGlitch(false);
      }, glitchMs);
    }, interval);
    timerRef.current = id;
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [images.length, interval, glitchMs]);

  return (
    <div className="relative mx-auto w-[90%] max-w-4xl h-[58vh] md:h-[68vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
      <img
        src={images[idx]}
        alt="TRVPPY art"
        className={`absolute inset-0 h-full w-full object-contain transition-transform duration-500 ${
          glitch ? "scale-105" : "scale-100"
        }`}
      />
      <img
        src={images[idx]}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-contain mix-blend-screen ${
          glitch ? "opacity-60" : "opacity-0"
        } transition-opacity duration-150`}
        style={{
          transform: "translate(2px,-1px)",
          filter: "contrast(1.2) saturate(1.3) hue-rotate(15deg)",
        }}
      />
      <img
        src={images[idx]}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-contain mix-blend-screen ${
          glitch ? "opacity-60" : "opacity-0"
        } transition-opacity duration-150`}
        style={{
          transform: "translate(-2px,1px)",
          filter: "contrast(1.2) saturate(1.3) hue-rotate(-15deg)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-amber-400/10 mix-blend-overlay" />
      <div className="scanlines" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

/* ================== PAGE ================== */
export default function Home() {
  const slides = [
    "/mockups/teeded-upres-2.png",
    "/mockups/TL.png",
    "/mockups/flawda.png",
  ];

  return (
    <>
      <Head>
        <title>TRVPPY DROP 001 — Twisted Reality</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SiteBackground />

      <main className="relative z-10 min-h-screen text-white flex flex-col">
        {/* GLOBAL HEADER (cart + persistent player w/ cover art) */}
        <SiteHeader />

        {/* SHOP GRID */}
        <section id="drop" className="order-1 md:order-2 py-10 px-3 sm:px-6">
          <div className="mx-auto max-w-screen-xl">
            <div className="mb-4 sm:mb-6 flex items-end justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Shop</h2>
             <p className="text-xs sm:text-sm text-white/60">2 designs · 4 variants</p>
            </div>

            {/* 2 columns on mobile, 4 on large */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 justify-items-center">

              {/* Twisted Love — Black (BACK first, FRONT on hover) */}
              <Link
                href={{ pathname: "/products/twisted-love", query: { color: "black" } }}
                className="group block w-full max-w-[220px] sm:max-w-none text-center focus:outline-none focus:ring-2 focus:ring-white/40 rounded-xl cursor-pointer"
              >
                <div className="relative w-full aspect-[4/5]">
                  {/* BACK visible by default */}
                  <img
                    src="/mockups/twisted-love-black.png"
                    alt="Twisted Love — back (black)"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                  />
                  {/* FRONT on hover */}
                  <img
                    src="/mockups/trvppy-black-front.png"
                    alt="Twisted Love — front (black)"
                    className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-semibold">
                  Twisted Love Tee (Black)<br />$55
                </p>
              </Link>

              {/* Twisted Love — White (BACK first, FRONT on hover) */}
              <Link
                href={{ pathname: "/products/twisted-love", query: { color: "white" } }}
                className="group block w-full max-w-[220px] sm:max-w-none text-center focus:outline-none focus:ring-2 focus:ring-white/40 rounded-xl cursor-pointer"
              >
                <div className="relative w-full aspect-[4/5]">
                  <img
                    src="/mockups/twisted-love-white.png"
                    alt="Twisted Love — back (white)"
                    className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                  />
                  <img
                    src="/mockups/trvppy-white-front.png"
                    alt="Twisted Love — front (white)"
                    className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-semibold">
                  Twisted Love Tee (White)<br />$55
                </p>
              </Link>

              {/* UZI × YACHTY — Black */}
              <Link
                href={{ pathname: "/products/uzi-yachty", query: { color: "black" } }}
                className="group block w-full max-w-[220px] sm:max-w-none text-center focus:outline-none focus:ring-2 focus:ring-white/40 rounded-xl cursor-pointer"
              >
                <div className="relative w-full aspect-[4/5]">
                  <img
                    src="/mockups/UZI-X-YACHTY-BLK.png"
                    alt="UZI × YACHTY Tee (Black)"
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-semibold">
                  UZI × YACHTY Tee (Black)<br />$45
                </p>
              </Link>

              {/* UZI × YACHTY — White */}
              <Link
                href={{ pathname: "/products/uzi-yachty", query: { color: "white" } }}
                className="group block w-full max-w-[220px] sm:max-w-none text-center focus:outline-none focus:ring-2 focus:ring-white/40 rounded-xl cursor-pointer"
              >
                <div className="relative w-full aspect-[4/5]">
                  <img
                    src="/mockups/UZI-X-YACHTY-WHITE.png"
                    alt="UZI × YACHTY Tee (White)"
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-3 text-xs sm:text-sm font-semibold">
                  UZI × YACHTY Tee (White)<br />$45
                </p>
              </Link>

            </div>
          </div>
        </section>

        {/* SHOWCASE */}
        <section id="showcase" className="order-2 md:order-1 py-6">
          <GlitchSlideshow images={slides} />
        </section>

        {/* INTRO */}
        <section id="intro" className="order-3 md:order-3 py-12 sm:py-16 text-center px-4">
          <p className="mx-auto max-w-4xl text-2xl sm:text-3xl font-bold leading-relaxed">
            For the ones that venture off beyond the edge,<br />
            and they live by their own rules.<br />
            <span className="text-red-500">THIS WORLD IS YOURZ</span>
          </p>
        </section>

        {/* ABOUT */}
        <section id="about" className="order-4 md:order-4 py-12 sm:py-16 text-center border-t border-white/10 px-4">
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-wide">ABOUT TRVPPY</h2>
          <p className="mx-auto max-w-xl text-base sm:text-lg leading-relaxed">
            TRVPPY isn’t just a brand — it’s a visual rebellion. A surreal world of art,
            twisted perspectives, and wearable storytelling. Every drop is a portal.
          </p>
        </section>
      </main>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        body { background-color: black; }
        .scanlines {
          pointer-events: none; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 100% 3px; animation: scan 6s linear infinite; opacity: 0.25;
        }
        @keyframes scan {
          0% { background-position: 0 0; opacity: .15; }
          50% { background-position: 0 100%; opacity: .35; }
          100% { background-position: 0 0; opacity: .15; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bgvid { display: none !important; }
          body { background: url('/mockups/res.png') center center / cover no-repeat; }
        }
        h1, h2, h3, h4, h5, h6, p, span, a, li, button {
          text-shadow: 0 2px 4px rgba(0,0,0,0.85);
        }
      `}</style>
    </>
  );
}
