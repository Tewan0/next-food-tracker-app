'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "../lib/supabase/client";


const AddFood = () => {
  const supabase = createClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    foodName: '',
    mealType: 'Breakfast', // ตั้งค่าเริ่มต้นให้สอดคล้องกับ UI
    date: new Date().toISOString().split('T')[0], // ตั้งค่าวันที่ปัจจุบันเป็นค่าเริ่มต้น
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to add a food entry.');
      }

      let imageUrl: string | null = null;

      // 2. Upload image if it exists
      if (formData.foodImage) {
        const file = formData.foodImage;
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('food_images')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('food_images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // 3. Insert data into the 'food_entries' table
      const { error: insertError } = await supabase.from('food_entries').insert({
        user_id: user.id,
        name: formData.foodName,
        meal_type: formData.mealType,
        eaten_at: formData.date,
        image_url: imageUrl,
      });

      if (insertError) {
        throw new Error(`Failed to save food entry: ${insertError.message}`);
      }

      setFeedback({ type: 'success', message: 'Food entry saved successfully!' });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh(); // Tell Next.js to refresh the data on the dashboard page
      }, 1000);

    } catch (err) {
      if (err instanceof Error) {
        setFeedback({ type: 'error', message: err.message });
      } else {
        setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
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

          {feedback && (
            <div className={`mb-4 rounded-lg p-4 text-center text-white ${feedback.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <option value="Breakfast" className="bg-purple-500">Breakfast (อาหารเช้า)</option>
                <option value="Lunch" className="bg-purple-500">Lunch (อาหารกลางวัน)</option>
                <option value="Dinner" className="bg-purple-500">Dinner (อาหารเย็น)</option>
                <option value="Snack" className="bg-purple-500">Snack (ของว่าง)</option>
              </select>
            </div>

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

            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Food'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;