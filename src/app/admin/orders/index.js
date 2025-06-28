"use client";

import { useState, useEffect } from "react";
import { Table, Input, Space, Select, Typography, Image, message } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import {
  handleGetOrdersByPageAPI,
  handleUpdateOrderStatusAPI,
} from "@/api/handlers/order";
import styles from "./styles.module.css";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, sort]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await handleGetOrdersByPageAPI(
        currentPage,
        sort,
        searchQuery
      );

      if (response) {
        const formattedOrders = response.map((order) => ({
          key: order.order_id,
          order_id: order.order_id,
          customer_name: order.user.full_name,
          customer_email: order.user.email,
          customer_phone: order.user.phone_number,
          order_date: order.created_at,
          created_at_display: order.created_at_display,
          total_amount: order.total_price,
          status: order.status,
          address: order.address,
          payment_method: order.payment_method,
          products: order.products,
          total_items: order.products.reduce(
            (sum, product) => sum + product.quantity,
            0
          ),
        }));
        setOrders(formattedOrders);
        setTotalOrders(formattedOrders.length);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value) => {
    setIsSearching(true);
    setSearchQuery(value);
    setCurrentPage(1);
    setTimeout(() => setIsSearching(false), 1000);
  }, 1000);

  const formatPrice = (price) => {
    return Intl.NumberFormat("vi-VI", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await handleUpdateOrderStatusAPI({
        order_id: orderId,
        status: newStatus,
      });

      setOrders(
        orders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );

      message.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Delivering", value: "Delivering" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const columns = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 100,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>{record.customer_name}</span>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {record.customer_email}
          </span>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {record.customer_phone}
          </span>
        </Space>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "created_at_display",
      key: "date",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "amount",
      render: (amount) => formatPrice(amount),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.order_id, value)}
          style={{ width: 120 }}
          disabled={updatingStatus}
          options={statusOptions}
        />
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment_method",
      key: "payment",
    },
    {
      title: "Items",
      dataIndex: "total_items",
      key: "items",
      render: (total_items) => `${total_items} items`,
    },
  ];

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Product",
        dataIndex: "product",
        key: "product",
        render: (_, record) => (
          <Space>
            <Image
              src={record.image_url}
              alt={record.product_name}
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
            <Space direction="vertical" size={0}>
              <span>{record.product_name}</span>
              <span style={{ fontSize: "12px", color: "#666" }}>
                Size: {record.size_name}
              </span>
            </Space>
          </Space>
        ),
      },
      {
        title: "Unit Price",
        dataIndex: "price",
        key: "price",
        render: (price) => formatPrice(price),
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Total",
        key: "total",
        render: (_, record) => formatPrice(record.price * record.quantity),
      },
    ];

    return (
      <div style={{ padding: "0 48px" }}>
        <div style={{ marginBottom: 16 }}>
          <strong>Shipping Address:</strong> {record.address}
        </div>
        <Table
          columns={columns}
          dataSource={record.products}
          pagination={false}
          rowKey="id"
        />
      </div>
    );
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Title level={3} className={styles.header}>
            Orders Management
          </Typography.Title>
          <Space>
            {isSearching && searchQuery !== "" && (
              <div
                style={{ display: "flex", alignItems: "center", marginTop: 8 }}
              >
                <LoadingOutlined
                  style={{ fontSize: 24, color: "#1890ff" }}
                  spin
                />
                <span style={{ marginLeft: 8, color: "#1890ff" }}>
                  Searching...
                </span>
              </div>
            )}
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            <Select
              defaultValue={sort}
              onChange={setSort}
              className={styles.sortSelect}
              options={[
                { label: "Date: Newest First", value: "date_desc" },
                { label: "Date: Oldest First", value: "date_asc" },
                { label: "Amount: High to Low", value: "amount_desc" },
                { label: "Amount: Low to High", value: "amount_asc" },
              ]}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalOrders,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
          expandable={{
            expandedRowRender: expandedRowRender,
          }}
          className={styles.ordersTable}
        />
      </Space>
    </div>
  );
}
