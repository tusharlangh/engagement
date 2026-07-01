import type { Metadata } from "next";
import { Andada_Pro, Great_Vibes } from "next/font/google";
import "./globals.css";

const andadaPro = Andada_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-andada-pro",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Invitation",
  description:
    "Chhaya & Dwij are inviting you to their engagement celebration!",
  icons: {
    icon: "/ganpati.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${andadaPro.variable} ${greatVibes.variable} font-body antialiased bg-[#FCE4EC] text-[#FCF9F2]`}
      >
        {children}
      </body>
    </html>
  );
}
