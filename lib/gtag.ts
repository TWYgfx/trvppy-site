export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""

// Log generic events
export const event = ({ action, params }: { action: string; params: any }) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    (window as any).gtag("event", action, params)
  }
}
