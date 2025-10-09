'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AddFood = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    mealType: 'breakfast',
    date: '',
    foodImage: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      setFormData((prev) => ({ ...prev, foodImage: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, foodImage: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New food entry submitted:', formData);
    alert('Food entry saved! Check the console for data.');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      {/* Back button */}
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link
          href="/dashboard"
          className="rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-10">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Add a New Food Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Food Name */}
            <div>
              <label htmlFor="foodName" className="mb-2 block font-semibold">
                Food Name
              </label>
              <input
                type="text"
                id="foodName"
                name="foodName"
                value={formData.foodName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white"
                placeholder="Ex. Pad Thai"
              />
            </div>

            {/* Meal Type */}
            <div>
              <label htmlFor="mealType" className="mb-2 block font-semibold">
                Meal Type
              </label>
              <select
                id="mealType"
                name="mealType"
                value={formData.mealType}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white outline-none transition duration-200 focus:border-white"
              >
                <option value="breakfast" className="bg-purple-500">Breakfast</option>
                <option value="lunch" className="bg-purple-500">Lunch</option>
                <option value="dinner" className="bg-purple-500">Dinner</option>
                <option value="snack" className="bg-purple-500">Snack</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="mb-2 block font-semibold">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white outline-none transition duration-200 focus:border-white"
              />
            </div>

            {/* Food Image */}
            <div className="flex flex-col items-center">
              <label className="mb-2 block font-semibold">Food Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <Image
                    src={imagePreview}
                    alt="Food Preview"
                    width={150}
                    height={150}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </div>
              )}
              <label
                htmlFor="foodImage"
                className="cursor-pointer rounded-full bg-white px-6 py-3 font-semibold text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
              >
                Choose Photo
              </label>
              <input
                type="file"
                id="foodImage"
                name="foodImage"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl cursor-pointer"
            >
              Save Food
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
