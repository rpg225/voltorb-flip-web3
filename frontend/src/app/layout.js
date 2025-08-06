// frontend/src/app/layout.js

import { Inter } from "next/font/google"; 
import "./globals.css";

// 1. Import the Providers component we created
import { Providers } from './providers'; 

const inter = Inter({ subsets: ["latin"] });

// You can customize the metadata for your app's browser tab title
export const metadata = {
  title: "Web3 Voltorb Flip",
  description: "A decentralized puzzle game on the blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap the entire application's children with the Providers component */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}