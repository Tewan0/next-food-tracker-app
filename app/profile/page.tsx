'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "../lib/supabase/client";

const Profile = () => {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: 'male',
    avatarUrl: '',
  });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const user = session.user;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, gender, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setFeedback({ type: 'error', message: 'Could not fetch profile data.' });
      } else if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          email: user.email || '',
          gender: profile.gender || 'male',
          avatarUrl: profile.avatar_url || '',
        });
        setImagePreview(profile.avatar_url || '/images/mock-profile.png');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

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
      setNewProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.clear(); // ล้าง console เก่า
    console.log("--- Starting Profile Update ---");
    setFeedback(null);
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedback({ type: 'error', message: 'You must be logged in to update your profile.' });
      setIsSaving(false);
      return;
    }

    let updatedAvatarUrl = formData.avatarUrl;
    const oldAvatarUrl = formData.avatarUrl;
    console.log("Step 1: Old avatar URL to be deleted:", oldAvatarUrl || "None");

    if (newProfileImage) {
      const file = newProfileImage;
      const filePath = `profiles/${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        setFeedback({ type: 'error', message: `Failed to upload image: ${uploadError.message}` });
        setIsSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      updatedAvatarUrl = urlData.publicUrl;
      console.log("Step 2: New image uploaded. New URL:", updatedAvatarUrl);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.fullName,
        gender: formData.gender,
        avatar_url: updatedAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      setFeedback({ type: 'error', message: `Failed to update profile: ${profileError.message}` });
      setIsSaving(false);
      return;
    }

    console.log("Step 3: Profile data in DB updated successfully.");
    let finalMessage = 'Profile updated successfully!';

    if (newProfileImage && oldAvatarUrl) {
      console.log("Step 4: Attempting to delete old image.");
      try {
        const oldAvatarPath = new URL(oldAvatarUrl).pathname.split('/avatars/')[1];
        console.log("Step 5: Extracted old image path:", oldAvatarPath);

        if (oldAvatarPath) {
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([oldAvatarPath]);

          if (removeError) {
            console.error("Step 6 - FAILED: Supabase returned a deletion error:", removeError.message);
            finalMessage += ` (Warning: Could not delete old image: ${removeError.message})`;
          } else {
            console.log("Step 6 - SUCCESS: Old image deleted successfully.");
          }
        } else {
          console.log("Step 5.1 - SKIPPED: oldAvatarPath could not be extracted.");
        }
      } catch (e) {
        console.error("Step 5 - FAILED: Error parsing oldAvatarUrl:", e);
        finalMessage += " (Warning: Could not process old image URL to delete it.)";
      }
    }

    setFeedback({ type: 'success', message: finalMessage });
    setFormData(prev => ({ ...prev, avatarUrl: updatedAvatarUrl }));
    setNewProfileImage(null);
    // No need to set isSaving to false here if we are redirecting
    // setIsSaving(false);

    // Redirect to dashboard after a short delay to show the success message
    setTimeout(() => {
      setIsSaving(false);
      router.push('/dashboard');
    }, 1000); // 1.5 seconds delay
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
    setFeedback({ type: 'error', message: `Error logging out: ${error.message}` });
  } else {
    // เมื่อ Logout สำเร็จ ให้เด้งกลับไปหน้าแรก
    router.push('/');
  }
};

  return (
    // The rest of your JSX code for the form goes here, no changes needed for the UI
    // Just copy-paste the return statement from your existing file
    <div className="relative min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100">
          &larr; Back to Dashboard
        </Link>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-white/20 p-6 text-white shadow-xl backdrop-blur-md md:p-10">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Edit Profile</h2>
          {feedback && (
            <div className={`mb-4 rounded-lg p-4 text-center text-white ${feedback.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {feedback.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <label className="mb-2 block font-semibold">Profile Image</label>
              {imagePreview && (
                <div className="mb-4">
                  <Image src={imagePreview} alt="Profile Preview" width={100} height={100} className="h-24 w-24 rounded-full border-2 border-white object-cover" />
                </div>
              )}
              <label htmlFor="profileImage" className="cursor-pointer rounded-full bg-white px-6 py-3 font-semibold text-purple-600 shadow-md transition duration-300 hover:bg-gray-100">
                Change Photo
              </label>
              <input type="file" id="profileImage" name="profileImage" onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <label htmlFor="fullName" className="mb-2 block font-semibold">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white placeholder-white/80 outline-none transition duration-200 focus:border-white" />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block font-semibold">Email</label>
              <input type="email" id="email" name="email" value={formData.email} disabled className="w-full rounded-lg border border-white/50 bg-white/50 p-3 text-white/80 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="gender" className="mb-2 block font-semibold">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full rounded-lg border border-white/50 bg-white/30 p-3 text-white">
                <option value="male" className="bg-purple-500">Male</option>
                <option value="female" className="bg-purple-500">Female</option>
                <option value="other" className="bg-purple-500">Other</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-full bg-white py-3 font-bold text-purple-600 shadow-lg transition duration-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-full border-2 border-white/50 py-3 font-bold text-white transition duration-300 hover:border-red-500 hover:bg-red-500/50 cursor-pointer"
          >
            Logout
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;