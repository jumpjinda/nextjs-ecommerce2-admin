import Layout from "@/components/Layout";
import axios from "axios";
import React, { useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/api/orders").then((response) => {
      response.data;
      setOrders(response.data);
    });
  }, []);

  console.log(orders.length);
  // console.log("Outside UseEffect orders =", orders);

  return (
    <Layout>
      <h1>Orders</h1>
      <table className="basic">
        <thead className="text-left">
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td
                className={`font-bold ${
                  order.paid ? "text-green-600" : "text-red-600"
                }`}
              >
                {order.paid ? "YES" : "NO"}
              </td>
              <td>
                {order.name} <br />
                {order.email} <br />
                {order.city} {order.postalCode} <br />
                {order.streetAddress} <br />
                {order.country}
              </td>
              <td>
                {order.line_items.map((l) => (
                  <>
                    {l.price_data.product_data.name} x {l.quantity} <br />
                  </>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default OrdersPage;
