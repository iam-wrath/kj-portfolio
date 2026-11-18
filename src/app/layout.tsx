import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", weight: ["400", "500"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jeffrey Agyemang Acheampong — Cybersecurity & Digital Media",
    template: "%s · Jeffrey Acheampong",
  },
  description:
    "Portfolio of Jeffrey Agyemang Acheampong, an aspiring cybersecurity analyst and digital media creator in Kumasi, Ghana — photography, videography, editing and live streaming.",
  openGraph: { type: "website", locale: "en_GB", siteName: "Jeffrey Agyemang Acheampong" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f2" },
  ],
};

/**
 * Runs before first paint:
 * - applies the saved theme (default dark), localStorage wrapped in try/catch
 * - marks reduced motion on <html> (plus a dev-only ?motion=reduce override for testing)
 * - enables motion-ready hiding and, once per session, the intro overlay
 * A safety timer reveals content if the motion system never boots.
 */
function bootScript(dev: boolean) {
  return `(function(){var d=document.documentElement;
try{var t=localStorage.getItem('theme');d.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){d.setAttribute('data-theme','dark');}
var q=location.search;var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches${dev ? "||/[?&]motion=reduce/.test(q)" : ""};
${dev ? "if(/[?&]webgl=off/.test(q))d.classList.add('force-no-webgl');" : ""}
if(reduce){d.classList.add('reduce-motion');return;}
d.classList.add('has-motion');
try{if(!sessionStorage.getItem('intro-seen')){d.classList.add('intro');sessionStorage.setItem('intro-seen','1');setTimeout(function(){d.classList.remove('intro');},3000);}}catch(e){}
setTimeout(function(){if(!window.__motionReady)d.classList.remove('has-motion');},2500);})();`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: bootScript(process.env.NODE_ENV === "development") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
