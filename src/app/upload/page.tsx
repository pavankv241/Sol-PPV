'use client';
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import idl from '../../idl/pay_per_view.json';
import { sha256 } from '@noble/hashes/sha256';

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1M2RhMTZjMy1jYzJhLTRlOTAtYWM4MS01ZTE2MDNmMGI5NWEiLCJlbWFpbCI6InBhdmFua3VtYXJrdi4yM21jYUBjYW1icmlkZ2UuZWR1LmluIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIxODNjYjFlMjc1M2E2OWQxYjBjIiwic2NvcGVkS2V5U2VjcmV0IjoiYmM5YTc0ZDg0OTM2OGI3ZjIzMGVjNWJhODljNDhiMGQzMGQyNWViNGNmMGE3OGI3N2IxNzcwZWRlMzMyYjA3MCIsImV4cCI6MTc3NjE0MTg2M30.YOr6VJ4gN_r6M3iV6DsSMb6QP7SZDt19BFfswtzI-_Y";

async function uploadToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload to Pinata');
  const data = await res.json();
  return data.IpfsHash;
}

const PROGRAM_ID = '5HXMEpyf9LumS9MsN6Zce1jL8ZMyFTrLdHCvgZrsXG7F';
const NETWORK = 'https://api.devnet.solana.com';
const FEE_RECEIVER = '3XGnzJECjyduopZcHSCYJb8iee2aHqsC5muj3DVKZmMG';
const FEE_AMOUNT_SOL = 0.001;

const UploadPage = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [displayTime, setDisplayTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Move useWallet hook here
  const { publicKey, signTransaction } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !thumbnail || !price || !displayTime) {
      setMessage('All fields are required.');
      return;
    }
    if (!publicKey || !signTransaction) {
      setMessage('Please connect your wallet.');
      return;
    }
    setLoading(true);
    setMessage('Uploading to IPFS...');
    try {
      const [videoHash, thumbnailHash] = await Promise.all([
        uploadToPinata(video),
        uploadToPinata(thumbnail),
      ]);
      setMessage('Paying upload fee...');
      try {
        const connection = new Connection(NETWORK, 'confirmed');
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(FEE_RECEIVER),
            lamports: parseFloat(price) * LAMPORTS_PER_SOL,
          })
        );
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;
        const signed = await signTransaction(tx);
        const txid = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction({ signature: txid, blockhash, lastValidBlockHeight }, 'confirmed');
      } catch (feeErr) {
        setMessage('Network fee payment failed: ' + (feeErr.message || feeErr));
        setLoading(false);
        return;
      }
      //Commented out for now
      // Store video metadata in localStorage
      const newVideo = {
        videoHash,
        thumbnailHash,
        price,
        displayTime,
        uploadedAt: Date.now(),
      };
      let videos = [];
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('ignitus_videos');
        if (existing) {
          try {
            videos = JSON.parse(existing);
          } catch {}
        }
        videos.push(newVideo);
        localStorage.setItem('ignitus_videos', JSON.stringify(videos));
      }
      setMessage('Upload successful!');
      setVideo(null);
      setThumbnail(null);
      setPrice('');
      setDisplayTime('');
    } catch (err) {
      setMessage('Upload failed: ' + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Video File</label>
          <input type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Thumbnail</label>
          <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] || null)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Price (SOL)</label>
          <input type="number" min="0" step="0.0001" value={price} onChange={e => setPrice(e.target.value)} className="border rounded px-2 py-1 w-full" required placeholder="e.g. 0.001" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Display Time (seconds)</label>
          <input type="number" min="1" value={displayTime} onChange={e => setDisplayTime(e.target.value)} className="border rounded px-2 py-1 w-full" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
    </div>
  );
};

export default UploadPage; 