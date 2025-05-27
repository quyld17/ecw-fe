"use client";

import {
  handleGetCustomersByPageAPI,
  handleGetCustomerOrdersAPI,
} from "../../../api/handlers/user";
import { useState, useEffect } from "react";
import { Table, Input, Space, Typography, message, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import styles from "./styles.module.css";
import {
  columns as orderColumns,
  handleOrders,
  handleOrderProducts,
} from "../../../component/user/purchase-history/orders-table";

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await handleGetCustomersByPageAPI(
        currentPage,
        searchQuery
      );

      if (response) {
        const formattedCustomers = response.map((customer) => ({
          key: customer.user_id,
          user_id: customer.user_id,
          full_name: customer.full_name,
          email: customer.email,
          phone_number: customer.phone_number,
          created_at: customer.created_at_display,
        }));
        setCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = async (record) => {
    try {
      setSelectedCustomer(record);
      setLoadingOrders(true);
      setOrdersModalVisible(true);

      const orders = await handleGetCustomerOrdersAPI(record.user_id);
      setCustomerOrders(orders || []);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      message.error("Failed to fetch customer orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 1000);

  const columns = [
    {
      title: "ID",
      dataIndex: "user_id",
      key: "id",
      width: 80,
    },
    {
      title: "Customer Name",
      dataIndex: "full_name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone",
    },
    {
      title: "Joined Date",
      dataIndex: "created_at",
      key: "date",
    },
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Title level={3} className={styles.header}>
            Customers Management
          </Typography.Title>
          <Input
            placeholder="Search customers..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleCustomerClick(record),
            style: { cursor: "pointer" },
          })}
          className={styles.customersTable}
        />

        <Modal
          title={`Orders - ${selectedCustomer?.full_name}`}
          open={ordersModalVisible}
          onCancel={() => setOrdersModalVisible(false)}
          width={1200}
          footer={null}
        >
          <Table
            columns={orderColumns}
            dataSource={handleOrders(customerOrders)}
            loading={loadingOrders}
            expandable={{
              expandedRowRender: (record) =>
                handleOrderProducts(record, customerOrders),
            }}
            pagination={false}
          />
        </Modal>
      </Space>
    </div>
  );
}
