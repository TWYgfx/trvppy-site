// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";

// providers
import { CartProvider } from "../context/CartContext";
import { PlayerProvider } from "../context/PlayerContext";

// drawer mounted once for the whole app
import CartDrawer from "../components/CartDrawer";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <PlayerProvider>
        <Component {...pageProps} />
        <CartDrawer />
      </PlayerProvider>
    </CartProvider>
  );
}
