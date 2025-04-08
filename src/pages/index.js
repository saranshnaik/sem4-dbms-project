import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRightIcon, AcademicCapIcon, CalendarIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Head>
        <title>TutorConnect - Find Your Perfect Tutor</title>
        <meta name="description" content="Connect with qualified tutors for personalized learning experiences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
          <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in">
              Find Your Perfect
              <span className="text-primary-600"> Tutor</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto animate-slide-up">
              Connect with expert tutors, schedule sessions, and achieve your academic goals with personalized learning experiences.
            </p>
            <div className="space-x-4 animate-fade-in">
              {!isLoggedIn ? (
                <>
                  <Link href="/auth/register" 
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors duration-200">
                    Get Started
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="/auth/login"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white border-2 border-primary-600 rounded-full hover:bg-primary-50 transition-colors duration-200">
                    Login
                  </Link>
                </>
              ) : (
                <Link href="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors duration-200">
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose TutorConnect?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <AcademicCapIcon className="w-12 h-12 text-primary-600" />,
                title: "Expert Tutors",
                description: "Connect with qualified and experienced tutors across various subjects."
              },
              {
                icon: <CalendarIcon className="w-12 h-12 text-primary-600" />,
                title: "Flexible Scheduling",
                description: "Book sessions at your convenience with our easy-to-use scheduling system."
              },
              {
                icon: <UserGroupIcon className="w-12 h-12 text-primary-600" />,
                title: "Personalized Learning",
                description: "Get customized attention and learning plans tailored to your needs."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "1", title: "Sign Up", description: "Create your free account" },
              { number: "2", title: "Find a Tutor", description: "Browse qualified tutors" },
              { number: "3", title: "Book a Session", description: "Schedule your lesson" },
              { number: "4", title: "Start Learning", description: "Begin your journey" }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform duration-200">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Student",
                content: "TutorConnect helped me improve my grades significantly. The tutors are knowledgeable and patient.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Parent",
                content: "Finding a qualified tutor for my child was easy with TutorConnect. Highly recommended!",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Tutor",
                content: "As a tutor, I love how easy it is to connect with students and manage my schedule.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="p-8 bg-white rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold mb-6">TutorConnect</h3>
              <p className="text-gray-400 mb-6">Making education accessible and personalized for everyone.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><span className="text-gray-500 cursor-not-allowed">About Us</span></li>
                <li><Link href="/tutors" className="text-gray-400 hover:text-white transition-colors">Find Tutors</Link></li>
                <li><Link href="/subjects" className="text-gray-400 hover:text-white transition-colors">Subjects</Link></li>
                <li><span className="text-gray-500 cursor-not-allowed">Pricing</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><span className="text-gray-500 cursor-not-allowed">FAQ</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Contact Us</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Privacy Policy</span></li>
                <li><span className="text-gray-500 cursor-not-allowed">Terms of Service</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>Email: support@tutorconnect.com</li>
                <li>Phone: +91 98765 43210</li>
                <li>Address: IIITV-ICD, Education Hub, Kevdi, Diu - 362520</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
