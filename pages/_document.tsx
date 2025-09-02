// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
         <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}></script>
<script dangerouslySetInnerHTML={{
  __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
      send_page_view: true,
    });
  `,
}} />

         {/* Meta Pixel (optional; only inject if ID is present) */}
{process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
  <>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1" width="1" style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  </>
)}

          {/* TikTok (optional) */}
          {/* <script dangerouslySetInnerHTML={{__html: `
            !function (w, d, t) { w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.load=function(e){var i="https://analytics.tiktok.com/i18n/pixel/events.js"; var s=d.createElement("script"); s.type="text/javascript"; s.async=!0; s.src=i; var a=d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(s,a); ttq._load=true; ttq.page(); };
            ttq.load('TIKTOK-PIXEL-ID'); ttq.page();
          `}}/> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
