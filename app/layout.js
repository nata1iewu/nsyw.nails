import { Cormorant_Garamond, Beau_Rivage, EB_Garamond } from "next/font/google";
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

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "nsyw.nails — your UCSD nail tech",
  description:
    "Gel-X manicures with a specialization in intricate art, based on campus at UCSD and in Los Angeles, California outside of the active school year! Book with me now! — @nsyw.nails.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body className="bg-stone text-ink font-body text-[17px] antialiased">{children}</body>
    </html>
  );
}
