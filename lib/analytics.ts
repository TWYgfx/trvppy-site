// lib/analytics.ts
type Item = {
  item_id: string;         // BEST: Shopify Variant GID
  item_name: string;
  price?: number;
  quantity?: number;
  item_brand?: string;     // e.g., "TRVPPY"
  item_category?: string;  // e.g., "Tees"
  item_variant?: string;   // e.g., "White / M"
};

const w = () => (typeof window !== "undefined" ? (window as any) : null);

export const Analytics = {
  // Flip these on once you add the scripts in _document.tsx
  useGA4: true,
  useMeta: true,
  useTikTok: false,

  viewItem(item: Item) {
    const win = w(); if (!win) return;
    if (this.useGA4 && win.gtag) {
      win.gtag("event", "view_item", { currency: "USD", value: item.price || 0, items: [item] });
    }
    if (this.useMeta && win.fbq) {
      win.fbq("track", "ViewContent", { content_ids: [item.item_id], content_type: "product", value: item.price || 0, currency: "USD" });
    }
    if (this.useTikTok && win.ttq) {
      win.ttq.track("ViewContent", { content_id: item.item_id, content_type: "product", value: item.price || 0, currency: "USD" });
    }
  },

  addToCart(item: Item) {
    const win = w(); if (!win) return;
    const value = (item.price || 0) * (item.quantity || 1);
    if (this.useGA4 && win.gtag) {
      win.gtag("event", "add_to_cart", { currency: "USD", value, items: [item] });
    }
    if (this.useMeta && win.fbq) {
      win.fbq("track", "AddToCart", { content_ids: [item.item_id], content_type: "product", value, currency: "USD" });
    }
    if (this.useTikTok && win.ttq) {
      win.ttq.track("AddToCart", { content_id: item.item_id, content_type: "product", value, currency: "USD" });
    }
  },

  removeFromCart(item: Item) {
    const win = w(); if (!win) return;
    const value = (item.price || 0) * (item.quantity || 1);
    if (this.useGA4 && win.gtag) {
      win.gtag("event", "remove_from_cart", { currency: "USD", value, items: [item] });
    }
    if (this.useMeta && win.fbq) {
      win.fbq("trackCustom", "RemoveFromCart", { content_ids: [item.item_id], value, currency: "USD" });
    }
    if (this.useTikTok && win.ttq) {
      win.ttq.track("RemoveFromCart", { content_id: item.item_id, value, currency: "USD" });
    }
  },

  beginCheckout(items: Item[], value: number) {
    const win = w(); if (!win) return;
    if (this.useGA4 && win.gtag) {
      win.gtag("event", "begin_checkout", { currency: "USD", value, items });
    }
    if (this.useMeta && win.fbq) {
      win.fbq("track", "InitiateCheckout", {
        value, currency: "USD",
        num_items: items.reduce((s,i)=>s+(i.quantity||1),0),
        content_ids: items.map(i=>i.item_id),
        content_type: "product",
      });
    }
    if (this.useTikTok && win.ttq) {
      win.ttq.track("InitiateCheckout", { value, currency: "USD" });
    }
  },
};
