import Image from "next/image";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
        Welcome to Ignitus Networks
      </h1>
      <p className="text-xl md:text-2xl text-[#b0b3c6] max-w-2xl">
        The next-generation decentralized pay-per-view platform. Stream, share, and earn with the power of blockchain.
      </p>
      <div className="flex gap-4 mt-4">
        <a href="/browse" className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform">
          Browse Streams
        </a>
        <a href="/upload" className="px-8 py-3 rounded-xl border border-purple-500 text-purple-300 font-semibold hover:bg-purple-900/30 transition-colors">
          Upload Content
        </a>
      </div>
    </section>
  );
}
