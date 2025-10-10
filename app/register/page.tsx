"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/app/lib/supabase/client';

const Register = () => {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "male",
    profileImage: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, profileImage: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            gender: formData.gender,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!formData.profileImage) {
        setSuccessMessage("Registration successful!");
        setTimeout(() => router.push("/dashboard"), 1500);
        return;
      }

      const user = signUpData.user;
      if (!user) {
        throw new Error("User was not created, cannot upload image.");
      }

      const file = formData.profileImage;
      const filePath = `profiles/${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`User created, but image upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error(`User and image uploaded, but failed to link image to profile: ${updateError.message}`);
      }

      setSuccessMessage("Registration successful!");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <Link href="/" className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100 sm:left-8 sm:top-8">
        &larr; Back to Home
      </Link>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-10">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Register</h2>
          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-500/30 p-4 text-center text-white">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/30 p-4 text-center text-white">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="mb-2 block font-semibold">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block font-semibold">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white" placeholder="johndoe@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block font-semibold">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white" placeholder="••••••••" />
            </div>
            <div>
              <label htmlFor="gender" className="mb-2 block font-semibold">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white">
                <option value="male" className="bg-purple-500">Male</option>
                <option value="female" className="bg-purple-500">Female</option>
                <option value="other" className="bg-purple-500">Other</option>
              </select>
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-2 block font-semibold">Profile Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <Image src={imagePreview} alt="Image Preview" width={100} height={100} className="rounded-full border-2 border-white object-cover" />
                </div>
              )}
              <label htmlFor="profileImage" className="w-full cursor-pointer rounded-lg bg-white/30 px-4 py-2 text-center text-white transition duration-200 hover:bg-white/40">
                Select Image
              </label>
              <input type="file" id="profileImage" name="profileImage" onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <button type="submit" className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white underline hover:text-gray-200">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;