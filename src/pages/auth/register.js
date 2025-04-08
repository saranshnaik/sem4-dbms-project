import Head from 'next/head';
import RegisterForm from '@/components/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Register - TutorConnect</title>
        <meta name="description" content="Create your TutorConnect account" />
      </Head>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <RegisterForm />
      </div>
    </div>
  );
} 