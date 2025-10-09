'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

// รับ props ที่ Next.js ส่งมาให้ ซึ่งจะมี params ที่ข้างในมี id อยู่
const EditFood = () => { // ลบ params ออกจากตรงนี้
  const router = useRouter();
  const supabase = createClient();
  const params = useParams(); // เรียกใช้ useParams hook
  const foodId = params.id as string; // ดึง id ออกมา

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    foodName: '',
    mealType: 'Breakfast',
    date: '',
    foodImage: null as File | null,
    existingImageUrl: null as string | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!foodId) return;

    const fetchFoodEntry = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('id', foodId)
        .single(); // ดึงข้อมูลมาแค่รายการเดียว

      if (error) {
        console.error("Error fetching food entry:", error);
        setFeedback({ type: 'error', message: 'Could not find the food entry to edit.' });
      } else if (data) {
        setFormData({
          foodName: data.name,
          mealType: data.meal_type,
          date: data.eaten_at,
          existingImageUrl: data.image_url,
          foodImage: null,
        });
        setImagePreview(data.image_url);
      }
      setIsLoading(false);
    };

    fetchFoodEntry();
  }, [foodId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, foodImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found.');

      let updatedImageUrl = formData.existingImageUrl;
      const oldImageUrl = formData.existingImageUrl;

      // 1. If new image is selected, upload it
      if (formData.foodImage) {
        const file = formData.foodImage;
        const filePath = `${user.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('food_images')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('food_images').getPublicUrl(filePath);
        updatedImageUrl = urlData.publicUrl;
      }

      // 2. Update the record in the database
      const { error: updateError } = await supabase
        .from('food_entries')
        .update({
          name: formData.foodName,
          meal_type: formData.mealType,
          eaten_at: formData.date,
          image_url: updatedImageUrl,
        })
        .eq('id', foodId);

      if (updateError) throw new Error(`Failed to update entry: ${updateError.message}`);

      // 3. If update successful and a new image was uploaded, delete the old one
      if (formData.foodImage && oldImageUrl) {
        const oldImagePath = new URL(oldImageUrl).pathname.split('/food_images/')[1];
        if (oldImagePath) {
          await supabase.storage.from('food_images').remove([oldImagePath]);
        }
      }

      setFeedback({ type: 'success', message: 'Food entry updated successfully!' });
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);

    } catch (err) {
      if (err instanceof Error) {
        setFeedback({ type: 'error', message: err.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
        <p className="text-white text-xl">Loading food entry...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-10">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Edit Food Entry</h2>
          
          {feedback && (
            <div className={`mb-4 rounded-lg p-4 text-center text-white ${feedback.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="foodName" className="mb-2 block font-semibold">Food Name</label>
              <input type="text" id="foodName" name="foodName" value={formData.foodName} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80" />
            </div>
            <div>
              <label htmlFor="mealType" className="mb-2 block font-semibold">Meal Type</label>
              <select id="mealType" name="mealType" value={formData.mealType} onChange={handleInputChange} className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white">
                <option value="Breakfast" className="bg-purple-500">Breakfast (อาหารเช้า)</option>
                <option value="Lunch" className="bg-purple-500">Lunch (อาหารกลางวัน)</option>
                <option value="Dinner" className="bg-purple-500">Dinner (อาหารเย็น)</option>
                <option value="Snack" className="bg-purple-500">Snack (ของว่าง)</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="mb-2 block font-semibold">Date</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-2 block font-semibold">Food Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <Image src={imagePreview} alt="Food Preview" width={150} height={150} className="h-32 w-32 rounded-lg object-cover" />
                </div>
              )}
              <label htmlFor="foodImage" className="cursor-pointer rounded-full bg-white px-6 py-3 font-semibold text-purple-600 shadow-md transition duration-300 hover:bg-gray-100">
                Change Photo
              </label>
              <input type="file" id="foodImage" name="foodImage" onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <button type="submit" className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFood;