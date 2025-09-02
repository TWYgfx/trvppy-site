// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";

// Vercel Web Analytics (simple, no config)
import { Analytics } from "@vercel/analytics/react";

// providers
import { CartProvider } from "../context/CartContext";
import { PlayerProvider } from "../context/PlayerContext";

// drawer mounted once for the whole app
import CartDrawer from "../components/CartDrawer";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Send a page_view on first load (only if GA is configured)
  useEffect(() => {
    if (!GA_ID) return;
    // @ts-ignore
    window.gtag?.("config", GA_ID, { page_path: window.location.pathname });
  }, [GA_ID]);

  // Send page_view on every client-side route change (only if GA is configured)
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
        <Component {...pageProps} />
        <CartDrawer />
        {/* Vercel Web Analytics – lightweight, privacy-friendly */}
        <Analytics />
      </PlayerProvider>
    </CartProvider>
  );
}
