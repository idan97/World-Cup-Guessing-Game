// frontend/pages/_app.tsx
import '../styles/globals.css'; // Correct relative path
import type { AppProps } from 'next/app';
import React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
