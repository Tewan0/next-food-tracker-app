'use client'; // Client Component เนื่องจากมีการใช้ State และ Input Events

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const mockUserProfile = {
  fullName: 'John Doe',
  email: 'johndoe@example.com',
  gender: 'male',
  profileImageUrl: '/images/mock-profile.png', // Mock default image
};

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: 'male',
    profileImage: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user data and pre-filling the form
    setFormData({
      fullName: mockUserProfile.fullName,
      email: mockUserProfile.email,
      password: '', // Password should not be pre-filled for security reasons
      gender: mockUserProfile.gender,
      profileImage: null,
    });
    setImagePreview(mockUserProfile.profileImageUrl);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for updating user data (e.g., API call)
    console.log('User data updated:', formData);
    alert('Profile updated successfully! Check the console for data.');
    // You might want to redirect to the dashboard after a successful update
    // For example: router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      {/* Back button */}
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link href="/dashboard" legacyBehavior passHref>
          <a className="rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100">
            &larr; Back to Dashboard
          </a>
        </Link>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-10">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-2 block font-semibold">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
                placeholder="John Doe"
              />
            </div>

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
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="mb-2 block font-semibold">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
              >
                <option value="male" className="bg-purple-500">
                  Male
                </option>
                <option value="female" className="bg-purple-500">
                  Female
                </option>
                <option value="other" className="bg-purple-500">
                  Other
                </option>
              </select>
            </div>

            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <label className="mb-2 block font-semibold">Profile Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <Image
                    src={imagePreview}
                    alt="Profile Preview"
                    width={100}
                    height={100}
                    className="rounded-full border-2 border-white object-cover"
                  />
                </div>
              )}
              <label
                htmlFor="profileImage"
                className="cursor-pointer rounded-full bg-white px-6 py-3 font-semibold text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
              >
                Change Photo
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden" // Hide the default input
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;