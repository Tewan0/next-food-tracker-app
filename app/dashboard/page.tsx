"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "../lib/supabase/client";


// สร้าง Type (ชนิดข้อมูล) สำหรับ Food Entry เพื่อให้โค้ดรัดกุมขึ้น
export type FoodEntry = {
  id: number;
  name: string;
  meal_type: string;
  eaten_at: string;
  image_url: string | null;
};

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
  const supabase = createClient();
  const router = useRouter();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mealTypeTranslations: { [key: string]: string } = {
    Breakfast: "อาหารเช้า",
    Lunch: "อาหารกลางวัน",
    Dinner: "อาหารเย็น",
    Snack: "ของว่าง",
  };

  useEffect(() => {
    const fetchFoodEntries = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("food_entries")
        .select("*")
        .order("eaten_at", { ascending: false }); // เรียงจากวันที่ล่าสุดก่อน

      if (error) {
        console.error("Error fetching food entries:", error.message);
        alert("Could not fetch food data.");
      } else {
        setFoodEntries(data as FoodEntry[]);
      }
      setLoading(false);
    };

    fetchFoodEntries();
  }, [router]);

  const handleDelete = async (entryId: number, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    // 1. Delete the database record
    const { error: dbError } = await supabase
      .from("food_entries")
      .delete()
      .eq("id", entryId);

    if (dbError) {
      alert(`Failed to delete entry: ${dbError.message}`);
      return;
    }

    // 2. If database deletion is successful, delete the associated image from storage
    if (imageUrl) {
      try {
        const imagePath = new URL(imageUrl).pathname.split("/food_images/")[1];
        if (imagePath) {
          await supabase.storage.from("food_images").remove([imagePath]);
        }
      } catch (e) {
        console.error("Could not delete image from storage:", e);
      }
    }

    // Refresh the list after deletion
    setFoodEntries(foodEntries.filter((entry) => entry.id !== entryId));
    alert("Entry deleted successfully!");
  };

  const filteredEntries = useMemo(() => {
    return foodEntries.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, foodEntries]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntries = filteredEntries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-bold text-white">Food Dashboard</h1>
          <div className="flex w-full items-center justify-between gap-4 md:w-auto">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-grow items-center"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food..."
                className="w-full rounded-l-full border border-gray-300 px-4 py-2 text-gray-700 outline-none focus:border-purple-600"
              />
              <button
                type="submit"
                className="rounded-r-full bg-white px-4 py-2 text-purple-600 shadow-sm transition duration-300 hover:bg-gray-100"
              >
                Search
              </button>
            </form>
            <div className="flex items-center gap-4">
              <Link
                href="/addfood"
                className="rounded-full bg-white px-6 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
              >
                + Add Food
              </Link>
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
                title="Edit Profile"
              >
                <User size={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg bg-white/30 p-4 shadow-xl backdrop-blur-md">
          <table className="min-w-full table-auto text-left text-white">
            <thead>
              <tr className="border-b border-white/50">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-lg">
                    Loading your food entries...
                  </td>
                </tr>
              ) : currentEntries.length > 0 ? (
                currentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/20 hover:bg-white/10"
                  >
                    <td className="px-4 py-3">{entry.eaten_at}</td>
                    <td className="px-4 py-3">
                      <Image
                        src={entry.image_url || "/images/foodTracker.jpg"} // Show default image if none
                        alt={entry.name}
                        width={50}
                        height={50}
                        className="h-12 w-12 rounded-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(entry.image_url)}
                      />
                    </td>
                    <td className="px-4 py-3">{entry.name}</td>
                    <td className="px-4 py-3">
                      {entry.meal_type}
                      {mealTypeTranslations[entry.meal_type] &&
                        ` (${mealTypeTranslations[entry.meal_type]})`}
                    </td>
                    <td className="flex items-center gap-2 px-4 py-3">
                      <Link
                        href={`/updatefood/${entry.id}`}
                        className="rounded-full bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(entry.id, entry.image_url)}
                        className="rounded-full bg-red-500 px-3 py-1 text-white transition hover:bg-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-lg">
                    No food entries found. Click Add Food to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredEntries.length > ITEMS_PER_PAGE && (
          <div className="mt-8 flex justify-center space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`rounded-full px-4 py-2 font-bold transition duration-300 ${
                  currentPage === index + 1
                    ? "bg-white text-purple-600"
                    : "bg-white/30 text-white hover:bg-white/50"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl">
            <Image
              src={selectedImage}
              alt="Enlarged Food"
              width={600}
              height={600}
              className="rounded-lg object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-black shadow-md hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
