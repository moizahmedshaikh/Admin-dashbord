"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";

interface ImageAsset {
  url: string;
}

interface ImageType {
  asset: ImageAsset;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  food?: { _id: string };
  image?: ImageType;
}

interface Customer {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  phone?: string;
}

interface OrderType {
  _id: string;
  orderId: string;
  total_price: number;
  order_date: string;
  status: string;
  customer?: Customer;
  items: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const query = `*[_type == "order"]{
          _id,
          orderId,
          status,
          order_date,
          total_price,
          clerkuserId,
          customer->{name, email, address, city, phone},
          items[]{
            name,
            quantity,
            price,
            food->{_id},
            image{
              asset->{url}
            }
          }
        }`;
        const fetchedOrders: OrderType[] = await client.fetch(query);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto overflow-x-auto">
      <h2 className="text-3xl font-semibold my-5 mb-3 border-b pb-2 text-center">
        Orders Management
      </h2>

      {/* Search Bar */}
      <div className="flex items-center gap-2 my-4 border p-2 rounded-lg shadow-sm">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 outline-none text-gray-700"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse border rounded-lg shadow-sm text-left text-sm min-w-max">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Total Price</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <FaSpinner className="animate-spin text-gray-600 text-2xl mx-auto" />
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <>
                  <tr
                    key={order.orderId}
                    className={`border-t hover:bg-gray-200 cursor-pointer ${
                      selectedOrder === order.orderId ? "bg-gray-300" : ""
                    }`}
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder === order.orderId ? null : order.orderId
                      )
                    }
                  >
                    <td className="p-3 border">{order.orderId}</td>
                    <td className="p-3 border">{order.customer?.name || "N/A"}</td>
                    <td className="p-3 border">{order.customer?.email || "N/A"}</td>
                    <td className="p-3 border">${order.total_price}</td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-2 py-1 text-sm font-medium rounded-lg ${
                          order.status === "completed"
                            ? "bg-green-300 text-green-700"
                            : order.status === "Pending"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-red-200 text-red-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                  </tr>
                  {selectedOrder === order.orderId && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="p-4 border">
                        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                        <p><strong>Customer:</strong> {order.customer?.name}</p>
                        <p><strong>Address:</strong> {order.customer?.address}, {order.customer?.city}</p>
                        <p><strong>Phone:</strong> {order.customer?.phone}</p>
                        <h4 className="font-semibold mt-3">Items:</h4>
                        <ul className="list-disc pl-5">
                          {order.items.map((item, index) => (
                            <li key={index} className="py-1">
                              {item.name} - {item.quantity} x ${item.price}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No matching orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
