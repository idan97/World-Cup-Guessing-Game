// pages/_app.tsx
import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/ui/Layout';
import '@/styles/globals.css';

type PageWithCustomTitle = {
  title?: string;
};

type CustomAppProps = AppProps & {
  Component: AppProps['Component'] & PageWithCustomTitle;
};

function MyApp({ Component, pageProps, router }: CustomAppProps) {
  // Removed username state and useEffect

  // Derive title from page component or route path
  const pageTitle = Component.title
    ? `${Component.title} - World Cup 2026`
    : `${router.pathname
        .split('/')
        .pop()
        ?.replace(/-/g, ' ')
        .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase())} - World Cup 2026`;

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>{pageTitle}</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
