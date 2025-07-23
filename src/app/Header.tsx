"use client";

import Link from 'next/link';
import IgnitusLogo from "./IgnitusLogo";
import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-opacity-60 backdrop-blur-lg bg-[#1a1333]/80 shadow-lg border-b border-[#2d2a4a]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <IgnitusLogo />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide">Ignitus Networks</span>
        </div>
        <nav className="flex gap-6 text-lg items-center">
          <Link href="/">Home</Link>
          <Link href="/browse">Browse</Link>
          <Link href="/upload">Upload</Link>
          <div className="ml-4"><WalletMultiButton /></div>
        </nav>
      </div>
    </header>
  );
} 