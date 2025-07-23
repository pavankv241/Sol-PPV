"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

const NETWORK = 'https://api.devnet.solana.com';
const FEE_RECEIVER = '3XGnzJECjyduopZcHSCYJb8iee2aHqsC5muj3DVKZmMG';

const BrowsePage = () => {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paidVideos, setPaidVideos] = useState({});
  const { publicKey, signTransaction, connected } = useWallet();
  const videoRef = useRef(null);

  // Load videos from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('ignitus_videos');
      if (existing) {
        try {
          setVideos(JSON.parse(existing));
        } catch {}
      }
    }
  }, []);

  // Load paid status from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && publicKey) {
      const paid = localStorage.getItem('ignitus_paid');
      if (paid) {
        try {
          const parsed = JSON.parse(paid);
          setPaidVideos(parsed[publicKey.toBase58()] || {});
        } catch {}
      } else {
        setPaidVideos({});
      }
    }
  }, [publicKey, showModal]);

  // Helper to set paid status for current wallet
  const setPaidForVideo = (videoHash: string, value: boolean) => {
    if (!publicKey) return;
    let paid: Record<string, Record<string, boolean>> = {};
    if (typeof window !== 'undefined') {
      const paidStr = localStorage.getItem('ignitus_paid');
      if (paidStr) {
        try {
          paid = JSON.parse(paidStr);
        } catch {}
      }
      const wallet = publicKey.toBase58();
      paid[wallet] = paid[wallet] || {};
      if (value) {
        paid[wallet][videoHash] = true;
      } else {
        delete paid[wallet][videoHash];
      }
      localStorage.setItem('ignitus_paid', JSON.stringify(paid));
      setPaidVideos({ ...paid[wallet] });
    }
  };

  // Handle payment
  const handlePay = async (video) => {
    setPaying(true);
    setPayError('');
    try {
      if (!publicKey || !signTransaction) throw new Error('Connect your wallet');
      const connection = new Connection(NETWORK, 'confirmed');
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(FEE_RECEIVER),
          lamports: parseFloat(video.price) * LAMPORTS_PER_SOL,
        })
      );
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      const signed = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction({ signature: txid, blockhash, lastValidBlockHeight }, 'confirmed');
      setPaidForVideo(video.videoHash, true);
    } catch (err) {
      setPayError(err.message || 'Payment failed');
      return;
    } finally {
      setPaying(false);
    }
  };

  // Handle opening modal
  const handleView = (video) => {
    setSelected(video);
    setShowModal(true);
  };

  // Handle closing modal (clear paid status)
  const handleClose = () => {
    if (selected && publicKey) {
      setPaidForVideo(selected.videoHash, false);
    }
    setShowModal(false);
    setSelected(null);
  };

  // Handle video end (clear paid status)
  const handleVideoEnd = () => {
    if (selected && publicKey) {
      setPaidForVideo(selected.videoHash, false);
    }
    setShowModal(false);
    setSelected(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Browse Videos</h1>
      {videos.length === 0 ? (
        <div className="text-gray-600">No videos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video, idx) => (
            <div key={idx} className="bg-[#232946] rounded-xl shadow-lg p-4 flex flex-col items-center">
              <img
                src={`https://gateway.pinata.cloud/ipfs/${video.thumbnailHash}`}
                alt="thumbnail"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="font-semibold text-lg mb-2">Price: {video.price} SOL</div>
              <div className="text-sm text-[#b0b3c6] mb-2">Display Time: {video.displayTime} min</div>
              <button
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 text-white font-bold shadow hover:scale-105 transition"
                onClick={() => handleView(video)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Modal for viewing video */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#232946] rounded-xl p-6 shadow-xl max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={handleClose}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{selected.title || 'Video'}</h2>
            {publicKey && paidVideos[selected.videoHash] ? (
              <video
                ref={videoRef}
                src={`https://gateway.pinata.cloud/ipfs/${selected.videoHash}`}
                controls
                autoPlay
                className="w-full rounded-lg mb-4"
                onEnded={handleVideoEnd}
              />
            ) : (
              <>
                <div className="mb-4">To view this video, please pay {selected.price} SOL.</div>
                <button
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 text-white font-bold shadow hover:scale-105 transition disabled:opacity-50"
                  onClick={() => handlePay(selected)}
                  disabled={paying}
                >
                  {paying ? 'Processing...' : 'Pay & View'}
                </button>
                {payError && <div className="text-red-500 mt-2">{payError}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage; 