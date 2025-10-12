"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { graphqlClient } from "../lib/graphqlClient"; // 🟢 عميل GraphQL
import { SIGNIN_MUTATION } from "../lib/mutations";   // 🟢 الميوتشن
import { useAuth } from "../contexts/AuthContext";   // 🟢 استدعاء الكونتكست

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // 🟢 جاي من الكونتكست

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      // 🟢 استدعاء الميوتشن من الـ GraphQL
      const res = await graphqlClient.request(SIGNIN_MUTATION, {
        input: { 
          email,
          password,
        },
      });

      const { token, user, message } = res.signin;

      if (!token) {
        toast.error(message || "Login failed ❌");
        return;
      }

      // 🟢 خزن اليوزر والتوكن في الـ context
      login(user, token);

      toast.success("تم تسجيل الدخول بنجاح ✅", { position: "top-right" });

      router.push("/"); // رجع للهوم
    } catch (err) {
      console.error("Login error:", err);
      toast.error("حدث خطأ أثناء تسجيل الدخول ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <Toaster />

      {/* Left Side - Login */}
      <div className="flex flex-col justify-center items-center bg-gray-100 p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Login to your account
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
              <Mail className="text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 text-black outline-none"
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg px-3">
              <Lock className="text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 text-black outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black cursor-pointer text-white py-3 rounded-lg hover:bg-amber-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Can’t remember your password?
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Register */}
      <div className="flex flex-col justify-center items-center bg-black text-white p-8">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-6">New here?</h2>
          <Link
            href="/register"
            className="block w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition"
          >
            Register with KEEPERsport
          </Link>
        </div>
      </div>
    </div>
  );
}
