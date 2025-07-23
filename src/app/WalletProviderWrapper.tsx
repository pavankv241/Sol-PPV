"use client";

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useMemo, ReactNode } from 'react';
import Header from "./Header";

export default function WalletProviderWrapper({ children }: { children: ReactNode }) {
    const endpoint = "https://api.devnet.solana.com";
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Header />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
} 