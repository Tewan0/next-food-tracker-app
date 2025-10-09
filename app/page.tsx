'use client'; // ใช้สำหรับ Client Component เนื่องจากมีการใช้ Next.js Link

import Link from 'next/link';
import Image from 'next/image';
import foodTracker from '@/foodTracker.jpg';

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white">
      <div className="flex flex-col items-center p-8 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
          Welcome to Food Tracker
        </h1>
        <p className="mb-8 text-xl md:text-2xl">Track your meal 😋</p>

        {/* Display Image */ }
        <div className="mb-8">
          <Image
            src={foodTracker}
            alt="Food Tracker App Logo"
            width={300}
            height={300}
            className="rounded-full shadow-lg"
            priority // เพื่อให้โหลดรูปภาพเร็วขึ้น
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/register" className="rounded-full bg-white px-8 py-3 font-semibold text-purple-600 transition duration-300 ease-in-out hover:bg-gray-100 hover:shadow-lg">
              Register
          </Link>
          <Link href="/login" className="rounded-full bg-purple-600 px-8 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-purple-700 hover:shadow-lg">
              Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;