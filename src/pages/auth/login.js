import Head from 'next/head';
import LoginForm from '@/components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Login - TutorConnect</title>
        <meta name="description" content="Login to your TutorConnect account" />
      </Head>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <LoginForm />
      </div>
    </div>
  );
} 