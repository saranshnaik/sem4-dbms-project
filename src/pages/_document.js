import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TutorConnect" />
        <meta
          name="description"
          content="TutorConnect - Connect with expert tutors for personalized learning experiences"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tutorconnect.com/" />
        <meta property="og:title" content="TutorConnect - Expert Tutoring Platform" />
        <meta
          property="og:description"
          content="Connect with expert tutors for personalized learning experiences"
        />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tutorconnect.com/" />
        <meta property="twitter:title" content="TutorConnect - Expert Tutoring Platform" />
        <meta
          property="twitter:description"
          content="Connect with expert tutors for personalized learning experiences"
        />
        <meta property="twitter:image" content="/og-image.png" />
      </Head>
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
