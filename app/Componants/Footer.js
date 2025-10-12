'use client';
import { useEffect, useState } from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa';
import { graphqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { usePathname } from 'next/navigation'; // ✅ عشان نعرف الصفحة الحالية

const GET_PAGE_BY_ID = gql`
  query getPageById($id: ID!) {
    page(id: $id) {
      id
      slug
    }
  }
`;

function FooterPageLink({ pageId }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await graphqlClient.request(GET_PAGE_BY_ID, { id: pageId });
        setPage(data.page);
      } catch (err) {
        console.error('Error fetching page:', err);
      }
    };
    fetchPage();
  }, [pageId]);

  if (!page) return null;

  return (
    <li className="cursor-pointer hover:text-amber-400">
      <a href={`/pages/${page.slug}`}>{page.title}</a>
    </li>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState([]);
  const [footerTexts, setFooterTexts] = useState([]);
  const pathname = usePathname(); // ✅ لتحديد الصفحة الحالية

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("https://keeper.in-brackets.online/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                publicSettings {
                  key
                  value
                  group
                }
              }
            `
          }),
        });

        const data = await res.json();
        const allSettings = data.data.publicSettings || [];

        const textSettings = allSettings.filter(
          (s) => s.group && s.group.toLowerCase() === "footer_text"
        );
        setFooterTexts(textSettings);

        const otherSettings = allSettings.filter(
          (s) => !s.group || s.group.toLowerCase() !== "footer_text"
        );
        setSettings(otherSettings);
      } catch (err) {
        console.error("Error fetching footer settings:", err);
      }
    }

    fetchSettings();
  }, []);

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.group]) acc[setting.group] = [];
    acc[setting.group].push(setting);
    return acc;
  }, {});

  return (
    <footer className="bg-neutral-900 text-white text-sm">

      {/* ✅ النصوص من Footer text — تظهر فقط في الـ Homepage */}
      {pathname === '/' && footerTexts.length > 0 && (
        <div className="bg-black text-white flex justify-center py-4 sm:py-6 px-4">
          <div className="text-center text-sm sm:text-base md:text-lg font-semibold max-w-4xl leading-relaxed space-y-3">
            {footerTexts.map((item, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: item.value }} />
            ))}
          </div>
        </div>
      )}

      {/* ✅ الاشتراك في النشرة البريدية */}
      <div className="bg-yellow-400 text-black px-4 py-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          type="email"
          placeholder="Your email address . . ."
          className="w-full sm:w-1/2 md:w-1/3 px-4 py-2 rounded bg-neutral-800 text-amber-50 placeholder-amber-200"
        />
        <button className="bg-white px-6 py-2 rounded font-bold cursor-pointer hover:bg-gray-200 w-full sm:w-auto">
          SIGN UP!
        </button>
      </div>

      {/* ✅ روابط الفوتر */}
      <div className="grid grid-cols-1 space-x-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-6 py-10 max-w-7xl mx-auto">
        {Object.entries(groupedSettings).map(([group, values]) => (
          <div key={group}>
            <h3 className="font-bold text-lg mb-4">{group}</h3>
            <ul className="space-y-4 space-x-2">
              {values.map((setting, i) => (
                <li key={i} className="cursor-pointer hover:text-amber-400">
                  {setting.value}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <hr className="border-gray-700" />

      {/* ✅ السوشيال ميديا */}
      <div className="flex justify-center gap-4 py-6 text-xl">
        <a href="https://www.facebook.com/keepersport" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
          <FaFacebook />
        </a>
        <a href="https://www.instagram.com/keepersport" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
          <FaInstagram />
        </a>
        <a href="https://www.youtube.com/keepersport" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
          <FaYoutube />
        </a>
        <a href="https://www.tiktok.com/@keepersport" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
          <FaTiktok />
        </a>
      </div>
    </footer>
  );
}
