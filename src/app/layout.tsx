import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NutriUp — Sua rotina, avaliada por IA",
  description:
    "App de nutrição com IA: monte seu plano, registre o dia em linguagem natural e suba no ranking com a galera.",
  applicationName: "NutriUp",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriUp",
  },
};

export const viewport: Viewport = {
  themeColor: "#16B26B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
