import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { NoiseOverlay } from "@/shared/components/effects/NoiseOverlay";
import { AppShell } from "@/shared/components/layout/AppShell";
import { QueryProvider } from "@/shared/lib/query-provider";
import "@/shared/styles/globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "OTT Platform", template: "%s · OTT Platform" },
  description: "Cinematic streaming, engineered for performance.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {/* Neutralize browser-extension DOM injection (e.g. Bitdefender's
            `bis_skin_checked`) that otherwise causes hydration mismatches.
            Runs before hydration and before extension content scripts mutate
            the DOM, so React never sees a server/client diff. Surgical: only
            blocks known extension attribute names. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var blocked=['bis_skin_checked','bis_register','__processed','bis_size'];function guard(orig){return function(name,value){try{if(name){for(var i=0;i<blocked.length;i++){if(String(name).indexOf(blocked[i])===0)return;}}}catch(e){}return orig.apply(this,arguments);};}var E=Element.prototype;if(E.setAttribute)E.setAttribute=guard(E.setAttribute);if(E.setAttributeNS)E.setAttributeNS=guard(E.setAttributeNS);}catch(e){}})();`,
          }}
        />
        <NoiseOverlay />
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
