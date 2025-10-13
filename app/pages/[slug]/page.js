'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { graphqlClient } from '../../lib/graphqlClient';
import { gql } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';

const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!) {
    pageBySlug(slug: $slug) {
      id
      slug
      name
      description
      created_at
      updated_at
    }
  }
`;

export default function PageSlug({ params }) {
  const { slug } = use(params); // فك الـ Promise

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        const data = await graphqlClient.request(GET_PAGE_BY_SLUG, { slug });
        setPage(data.pageBySlug);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );

  if (!page)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Page not found.</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* اسم الصفحة */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center text-gray-900">
        {page.name}
      </h1>

      {/* معلومات صغيرة */}
      <div className="flex justify-center gap-6 mb-12 text-gray-500 text-sm sm:text-base">
        <p>Created: {new Date(page.created_at).toLocaleDateString()}</p>
        <p>Updated: {new Date(page.updated_at).toLocaleDateString()}</p>
      </div>

      {/* محتوى الصفحة */}
      <div
        className="prose max-w-none mx-auto text-white dark:text-white
                   prose-headings:text-white prose-headings:font-bold
                   prose-a:text-yellow-500 hover:prose-a:text-yellow-400
                   prose-img:rounded-lg prose-img:shadow-lg
                   prose-ol:pl-5 prose-ul:pl-5
                   sm:prose-sm md:prose-md lg:prose-lg"
        dangerouslySetInnerHTML={{ __html: page.description }}
      />

      {/* زر العودة للصفحة الرئيسية */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
