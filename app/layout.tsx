import type { Metadata } from "next";
import "./globals.css";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? "";
const metadataBase = owner
  ? new URL(repository.endsWith(".github.io") ? `https://${repository}` : `https://${owner}.github.io/${repository}`)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Electrical Wiring Unit 2 | Drawings and Specifications",
  description: "A guided, visual study tool for electrical drawings, specifications, and material takeoffs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
