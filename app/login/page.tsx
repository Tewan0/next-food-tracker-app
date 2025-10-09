'use client';

import Link from 'next/link';
import { useState, ChangeEvent, useEffect } from 'react'; // เพิ่ม useEffect
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";
import { createClient } from "../lib/supabase/client";

const supabase = createClient();

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ++ เพิ่ม useEffect นี้เข้าไปทั้งหมด ++
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // เมื่อมีการล็อกอินสำเร็จ (ไม่ว่าจะด้วย Google หรือ Email)
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard');
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    }
    // ไม่ต้องมี router.push('/dashboard') ที่นี่แล้ว เพราะ useEffect จะจัดการให้
  };

  const handleLoginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
};

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
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

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/50"></div>
              <span className="mx-4 flex-shrink text-sm text-white/80">OR</span>
              <div className="flex-grow border-t border-white/50"></div>
            </div>

            <button
              type="button"
              onClick={handleLoginWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 font-bold text-gray-700 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl cursor-pointer"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </button>
          </form>

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