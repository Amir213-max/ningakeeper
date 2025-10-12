"use client";

import { useState, useEffect } from "react";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_ORDERS, GET_DEFAULT_WISHLIST } from "../lib/queries";
import toast from "react-hot-toast";

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [user, setUser] = useState({
    name: "Loading...",
    email: "Loading...",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    fetchUserData();
    fetchOrders();
    fetchWishlists();
  }, []);

  const fetchUserData = async () => {
    // هنا لو عندك GraphQL API لجلب بيانات المستخدم الحالية
    setUser({
      name: "Amir Ghareeb",
      email: "amir@example.com",
    });
  };

  const fetchOrders = async () => {
    try {
      const { orders } = await graphqlClient.request(GET_ORDERS);
      setOrders(orders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    }
  };

  const fetchWishlists = async () => {
    try {
      const { wishlists } = await graphqlClient.request(GET_DEFAULT_WISHLIST);
      setWishlists(wishlists);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch wishlists");
    }
  };

  const handleProfileSave = () => {
    // هنا ممكن تعمل Mutation لتحديث بيانات المستخدم
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    // هنا ممكن تعمل Mutation لتغيير كلمة السر
    toast.success("Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

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
        <button
          className={`pb-2 ${activeTab === "wishlists" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setActiveTab("wishlists")}
        >
          Wishlists
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div>
  <label className="block font-medium mb-1">Email</label>
  <input
    type="email"
    className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed text-black"
    value={user.email}
    readOnly
  />
</div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleProfileSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="border p-6 rounded-lg shadow max-w-md">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handlePasswordChange}
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="border p-4 rounded-lg shadow">
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

      {activeTab === "wishlists" && (
        <div className="border p-4 rounded-lg shadow max-w-md">
          <h2 className="text-xl font-semibold mb-4">Default Wishlists</h2>
          {wishlists.length > 0 ? (
            <ul className="list-disc pl-5">
              {wishlists.map((w) => (
                <li key={w.id}>{w.name}</li>
              ))}
            </ul>
          ) : (
            <p>No default wishlists found.</p>
          )}
        </div>
      )}
    </div>
  );
}
