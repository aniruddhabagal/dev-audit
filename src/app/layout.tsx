import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DevAudit — Your Codebase's Second Brain",
  description:
    "Drop your GitHub repo. Get a brutal, honest, senior-engineer-level audit with AI agents that actually fix things.",
  openGraph: {
    title: "DevAudit — Your Codebase's Second Brain",
    description:
      "Drop your GitHub repo. Get a brutal, honest, senior-engineer-level audit with AI agents that actually fix things.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Satoshi from Fontshare CDN */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@200,300,400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${newsreader.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
