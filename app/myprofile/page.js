import { Suspense } from "react";
import MyProfileClient from "./MyProfileClient";

export const dynamic = "force-dynamic";

export default function MyProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    }>
      <MyProfileClient />
    </Suspense>
  );
}
