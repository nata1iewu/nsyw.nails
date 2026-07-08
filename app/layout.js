import { Cormorant_Garamond, Beau_Rivage, Jost } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const script = Beau_Rivage({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Nat W Nails — Gel Manicures",
  description:
    "Gel manicures with precision. Book a slot with Nat W Nails — @natwnails.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body className="bg-stone text-ink font-body antialiased">{children}</body>
    </html>
  );
}
