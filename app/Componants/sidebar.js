'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaUser, FaComments } from 'react-icons/fa';
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { graphqlClient } from "../lib/graphqlClient";
import { Root_CATEGORIES } from "../lib/queries";
import { motion, AnimatePresence } from "framer-motion";
import CartSidebar from "./CartSidebar";
import Image from "next/image";
import { useChat } from "../contexts/ChatContext";


export default function Sidebar({ isOpen, setIsOpen, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openParentId, setOpenParentId] = useState(null);
  const router = useRouter();

  const { openChat } = useChat(); // استدعاء chat context

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await graphqlClient.request(Root_CATEGORIES);
        setCategories(data?.rootCategories || []);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const parentCategories = categories
    .filter((cat) => cat.parent && cat.parent.name)
    .reduce((acc, curr) => {
      const exists = acc.find((p) => p.parent.id === curr.parent.id);
      if (!exists) acc.push(curr);
      return acc;
    }, []);

  const handleParentClick = (parentId, parentName) => {
    if (openParentId === parentId) {
      setOpenParentId(null);
    } else {
      setOpenParentId(parentId);
      router.push(`/${parentName.replace(/\s+/g, "")}`);
    }
  };

  return (
    <>
      {/* Sidebar للشاشات الكبيرة */}
      <aside className="hidden lg:block bg-black text-white w-100 min-h-screen py-4 px-3 font-sans">
        <SidebarContent
          parentCategories={parentCategories}
          categories={categories}
          openParentId={openParentId}
          handleParentClick={handleParentClick}
          onSelectCategory={onSelectCategory}
          setIsOpen={setIsOpen}
        />
      </aside>

      {/* Drawer للشاشات الصغيرة والمتوسطة */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-black text-white z-50 shadow-xl py-4 px-3 font-sans overflow-y-auto lg:hidden flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4 }}
            >
              {/* زر الإغلاق */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-amber-400"
                >
                  <X size={22} />
                </button>
              </div>

              {/* قائمة الأقسام */}
              <SidebarContent
                parentCategories={parentCategories}
                categories={categories}
                openParentId={openParentId}
                handleParentClick={handleParentClick}
                onSelectCategory={(id) => {
                  onSelectCategory?.(id);
                  setIsOpen(false);
                }}
                setIsOpen={setIsOpen}
              />

              {/* أيقونات أسفل الستارة */}
              <div className="mt-auto pt-4 border-t border-neutral-700 flex justify-between items-center w-full px-3">

                {/* Logo */}
                <Link href="/">
                  <Image
                    src="https://static-assets.keepersport.net/dist/82d4dde2fe42e8e4fbfc.svg"
                    alt="LOGO"
                    width={30}
                    height={30}
                    className="object-contain"
                    priority
                  />
                </Link>

                {/* Cart */}
               

                {/* Chat */}
                <button
                  onClick={openChat}
                  className="text-white hover:text-amber-400 transition-colors duration-200"
                >
                  <FaComments size={20} />
                </button>


                <button
                  onClick={() => setCartOpen(true)}
                  className="text-white hover:text-amber-400 transition-colors duration-200"
                >
                  <FaShoppingCart size={20} />
                </button>

                {/* User */}
                <Link
                  href="/login"
                  className="text-white hover:text-red-600 transition-colors duration-200"
                >
                  <FaUser size={20} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

// محتوى القائمة
function SidebarContent({
  parentCategories,
  categories,
  openParentId,
  handleParentClick,
  onSelectCategory,
  setIsOpen,
}) {
  return (
    <ul className="space-y-1">
      {parentCategories.map((item) => {
        const parent = item.parent;
        const subCategories = categories.filter(
          (sub) => sub.parent?.id === parent.id
        );
        const isOpen = openParentId === parent.id;

        return (
          <li key={parent.id} className="border-b border-neutral-700 pb-1">
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-700 transition-all"
              onClick={() => handleParentClick(parent.id, parent.name)}
            >
              <span className="text-sm font-medium hover:text-amber-400">
                {parent.name}
              </span>
              {subCategories.length > 0 &&
                (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </div>

            {isOpen && subCategories.length > 0 && (
              <ul className="ml-4 mt-1 border-l border-neutral-700 space-y-1">
                {subCategories.map((sub) => (
                  <li
                    key={sub.id}
                    className="px-3 py-1 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-800 hover:text-white transition-all"
                    onClick={() => {
                      onSelectCategory?.(sub.id);
                      setTimeout(() => {
                        setIsOpen?.(false);
                      }, 50);
                    }}
                  >
                    {sub.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
