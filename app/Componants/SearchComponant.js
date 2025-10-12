'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function SearchComponent({ onClose }) {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (searchText.trim()) {
//       router.push(`/search?q=${encodeURIComponent(searchText)}`);
//       if (onClose) onClose();
//     }
//   };

  return (
    <>
      {/* خلفية شفافة تغطي الشاشة */}
      <div
        className="fixed inset-0 bg-black opacity-80 z-40"
        onClick={onClose}
      ></div>

      {/* مربع البحث */}
      <form
        // onSubmit={handleSubmit}
        className="fixed animate-slide-down top-7 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-lg p-3 flex gap-2 z-50 w-[90%] max-w-md"
        >

        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 px-3 py-2 rounded text-sm w-full focus:outline-none"
        //   value={searchText}
        //   onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black px-4 py-2 rounded text-sm font-bold"
        >
          <FaSearch />
        </button>
      </form>
    </>
  );
}
