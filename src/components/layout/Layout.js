import Navbar from '../Navbar';
import Head from 'next/head';

export default function Layout({ children, title = 'TutorConnect', hideNavbar = false }) {
  return (
    <>
      <Head>
        <title>{title} - Expert Tutoring Platform</title>
        <meta name="description" content="Connect with qualified tutors for personalized learning experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">
        {!hideNavbar && <Navbar />}
        <main className="flex-grow">{children}</main>
      </div>
    </>
  );
} 