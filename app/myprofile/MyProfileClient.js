"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_ORDERS, GET_PROFILE } from "../lib/queries";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { LogOut, User, Lock, Package, Save, Loader2 } from "lucide-react";

export default function MyProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "password", "orders"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    fetchUserData();
    fetchOrders();
  }, [searchParams]);

  // 🟡 Fetch Logged-in User Data using profileByToken
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first!");
        router.push("/login");
        return;
      }

      // Pass token as variable to the query
      const { profileByToken } = await graphqlClient.request(GET_PROFILE, {
        token: token,
      });
      setUser(profileByToken);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch User Orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      graphqlClient.setHeaders({
        Authorization: `Bearer ${token}`,
      });

      const { orders } = await graphqlClient.request(GET_ORDERS);
      setOrders(orders || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    }
  };

  // 🟢 Update Profile
  const handleProfileSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement actual profile update mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // 🟡 Change Password
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }
    
    setSaving(true);
    try {
      // TODO: Implement actual password change mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Handle Logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  // 🟢 Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your profile.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 🟣 Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-yellow-400 text-yellow-600 bg-yellow-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5" />
              Profile Info
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === "password"
                  ? "border-b-2 border-yellow-400 text-yellow-600 bg-yellow-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("password")}
            >
              <Lock className="w-5 h-5" />
              Change Password
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === "orders"
                  ? "border-b-2 border-yellow-400 text-yellow-600 bg-yellow-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <Package className="w-5 h-5" />
              Orders ({orders.length})
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              Edit Profile
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-600"
                  value={user.email || ""}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              {user.phone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
              )}
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Change Password
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Enter your new password (min. 8 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Confirm your new password"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Order #{order.number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">
                        {order.total_amount?.toFixed(2) || "0.00"} SAR
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.payment_status || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-yellow-600 font-semibold hover:text-yellow-700 transition-colors">
                      View Items ({order.items?.length || 0})
                    </summary>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <ul className="space-y-2">
                        {order.items?.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.product_name || "Unknown Product"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity} × {item.unit_price?.toFixed(2) || "0.00"} SAR
                              </p>
                            </div>
                            <p className="font-semibold text-gray-800">
                              {item.total_price?.toFixed(2) || "0.00"} SAR
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No orders found</p>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

