// frontend/src/app/page.js

'use client';

import { useState } from "react";
import WalletConnect from '@/components/WalletConnect'


export default function Home() {

  const [currentAccount, setCurrentAccount] = useState(null);

  return (
    <main className="flex min-h-screen flex-col items-center  p-8 bg-gray-900 text-white">
      <div className="w-full max-5-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="text-2xl font-bold">Web3 Voltorb Flip</p>
          <WalletConnect
            currentAccount={currentAccount}
            setCurrentAccount={setCurrentAccount}
          /> 
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        {/* This is where the main game board will go */}
        {currentAccount ? (
          <h2 className="text-xl mt-8">
            Welcome, player!
            Let&apos;s get ready to play.
          </h2>
        ) : (
          <h2 className="text-xl mt-8">
            Please Connect your wallet to start playing.
          </h2>
        )}
      </div>

      {/* Game components will go here */}
    </main>
  );
}