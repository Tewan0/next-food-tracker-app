'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';

import kapraoChicken from '/app/images/kapraoChicken.jpg';
import salmonSteak from '/app/images/salmonSteak.jpg';
import khaoniaoMuPing from '/app/images/khaoniaoMuPing.jpg';
import somtamThai from '/app/images/somtamThai.jpg';
import kuaitiaoRuea from '/app/images/kuaitiaoRuea.jpg';
import pizza from '/app/images/pizza.jpg';
import khaomankai from '/app/images/khaomankai.jpg';
import kaengKhiaowanKai from '/app/images/kaengKhiaowanKai.jpg';
import chokMu from '/app/images/chokMu.jpg';
import phatThaiKungSot from '/app/images/phatThaiKungSot.jpg';

// Mock Data for demonstration
const MOCK_FOOD_ENTRIES = [
  { id: 1, date: '2025-09-01', image: kapraoChicken, name: 'ผัดกะเพราไก่', meal: 'มื้อกลางวัน' },
  { id: 2, date: '2025-09-01', image: salmonSteak, name: 'สเต็กปลาแซลมอน', meal: 'มื้อเย็น' },
  { id: 3, date: '2025-09-02', image: khaoniaoMuPing, name: 'ข้าวเหนียวหมูปิ้ง', meal: 'มื้อเช้า' },
  { id: 4, date: '2025-09-02', image: somtamThai, name: 'ส้มตำไทย', meal: 'มื้อกลางวัน' },
  { id: 5, date: '2025-09-03', image: kuaitiaoRuea, name: 'ก๋วยเตี๋ยวเรือ', meal: 'มื้อกลางวัน' },
  { id: 6, date: '2025-09-03', image: pizza, name: 'พิซซ่า', meal: 'มื้อเย็น' },
  { id: 7, date: '2025-09-04', image: khaomankai, name: 'ข้าวมันไก่', meal: 'มื้อกลางวัน' },
  { id: 8, date: '2025-09-04', image: kaengKhiaowanKai, name: 'แกงเขียวหวานไก่', meal: 'มื้อเย็น' },
  { id: 9, date: '2025-09-05', image: chokMu, name: 'โจ๊กหมู', meal: 'มื้อเช้า' },
  { id: 10, date: '2025-09-05', image: phatThaiKungSot, name: 'ผัดไทยกุ้งสด', meal: 'มื้อกลางวัน' },
];

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<StaticImageData | null>(null);

  // Filter food entries
  const filteredEntries = useMemo(() => {
    return MOCK_FOOD_ENTRIES.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-bold text-white">Food Dashboard</h1>
          <div className="flex w-full items-center justify-between gap-4 md:w-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-grow items-center">
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
            {/* Add Food Button */}
            <Link
              href="/addfood"
              className="rounded-full bg-white px-6 py-2 text-purple-600 shadow-md transition duration-300 hover:bg-gray-100"
            >
              + Add Food
            </Link>
          </div>
        </div>

        {/* Food Tracker Table */}
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
              {currentEntries.length > 0 ? (
                currentEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/20 hover:bg-white/10">
                    <td className="px-4 py-3">{entry.date}</td>
                    <td className="px-4 py-3">
                      <Image
                        src={entry.image}
                        alt={entry.name}
                        width={50}
                        height={50}
                        className="h-12 w-12 rounded-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(entry.image)}
                      />
                    </td>
                    <td className="px-4 py-3">{entry.name}</td>
                    <td className="px-4 py-3">{entry.meal}</td>
                    <td className="flex items-center gap-2 px-4 py-3">
                      <button className="rounded-full bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600">
                        Edit
                      </button>
                      <button className="rounded-full bg-red-500 px-3 py-1 text-white transition hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-lg">
                    No food entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredEntries.length > ITEMS_PER_PAGE && (
          <div className="mt-8 flex justify-center space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`rounded-full px-4 py-2 font-bold transition duration-300 ${
                  currentPage === index + 1
                    ? 'bg-white text-purple-600'
                    : 'bg-white/30 text-white hover:bg-white/50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Enlarged Image */}
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
