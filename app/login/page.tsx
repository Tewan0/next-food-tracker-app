'use client'; // Client Component เนื่องจากมีการใช้ State, Link และ Input Events

import Link from 'next/link';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation'; // ✅ ใช้ useRouter แทน Router เก่า

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const router = useRouter(); // ✅ สร้าง instance ของ router

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: logic ตรวจสอบ login ที่นี่ เช่น API call ไป backend
    console.log('Login data submitted:', formData);

    // ✅ ถ้า login สำเร็จ ให้ redirect ไปหน้า dashboard
    router.push('/dashboard');

    // alert('Login success! Redirecting to dashboard...');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      {/* Back button */}
      <Link
        href="/"
        className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100 sm:left-8 sm:top-8"
      >
        &larr; Back to Home
      </Link>

      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-8">
          <h2 className="mb-6 text-center text-3xl font-bold">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block font-semibold">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
                placeholder="johndoe@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block font-semibold">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
                placeholder="••••••••"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl"
            >
              Login
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm">
            Don{"'"}t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-white underline hover:text-gray-200"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
