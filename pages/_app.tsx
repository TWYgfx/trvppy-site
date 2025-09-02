// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";

import { Analytics } from "@vercel/analytics/react";

import { CartProvider } from "../context/CartContext";
import { PlayerProvider } from "../context/PlayerContext";

import CartDrawer from "../components/CartDrawer";
import SiteBackground from "../components/SiteBackground";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Initial pageview (only if GA is configured)
  useEffect(() => {
    if (!GA_ID) return;
    // @ts-ignore
    window.gtag?.("config", GA_ID, { page_path: window.location.pathname });
  }, [GA_ID]);

  // SPA route changes -> pageview (only if GA is configured)
  useEffect(() => {
    if (!GA_ID) return;
    const handleRouteChange = (url: string) => {
      // @ts-ignore
      window.gtag?.("config", GA_ID, { page_path: url });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events, GA_ID]);

  return (
    <CartProvider>
      <PlayerProvider>
        {/* Global background video at z-0 */}
        <SiteBackground />

        {/* App content above the background */}
        <div className="relative z-10">
          <Component {...pageProps} />
          <CartDrawer />
          <Analytics />
        </div>
      </PlayerProvider>
    </CartProvider>
  );
}
