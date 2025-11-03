"use client";

import { useState, useEffect } from "react";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_ORDERS, GET_ME } from "../lib/queries";
import toast from "react-hot-toast";

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  // 🟡 Fetch Logged-in User Data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login first!");
        return;
      }

      // Attach token to request header dynamically
      graphqlClient.setHeaders({
        Authorization: `Bearer ${token}`,
      });

      const { me } = await graphqlClient.request(GET_ME);
      setUser(me);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data.");
    }
  };

  // 🟢 Fetch User Orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      graphqlClient.setHeaders({
        Authorization: `Bearer ${token}`,
      });

      const { orders } = await graphqlClient.request(GET_ORDERS);
      setOrders(orders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    }
  };

  // 🟢 Update Profile (optional)
  const handleProfileSave = () => {
    toast.success("Profile updated successfully!");
  };

  // 🟡 Change Password
  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  // 🟢 Loading State
  if (!user)
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Loading profile...</p>
      </div>
    );

  // 🟣 Render
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 ${activeTab === "profile" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Info
        </button>
        <button
          className={`pb-2 ${activeTab === "password" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
        <button
          className={`pb-2 ${activeTab === "orders" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="border p-6   shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border p-2 "
                value={user.name || ""}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border p-2  bg-gray-100 cursor-not-allowed text-black"
                value={user.email || ""}
                readOnly
              />
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2  hover:bg-blue-600"
              onClick={handleProfileSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="border p-6   shadow max-w-md">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border p-2  "
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                className="w-full border p-2  "
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border p-2  "
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2   hover:bg-green-600"
              onClick={handlePasswordChange}
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="border p-4   shadow">
                <p>
                  <span className="font-medium">Order Number:</span> {order.number}
                </p>
                <p>
                  <span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span> {order.payment_status}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-500">
                    View Items ({order.items.length})
                  </summary>
                  <ul className="mt-2 list-disc pl-5">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product_name} - Qty: {item.quantity} - ${item.total_price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
}
