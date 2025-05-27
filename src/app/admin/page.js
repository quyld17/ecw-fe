"use client";

import styles from "./styles.module.css";
import { Layout, Tabs, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import Head from "next/head";

import ProductsTab from "./products";
import OrdersTab from "./orders";
import CustomersTab from "./customers";

const { Header, Content } = Layout;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("products");
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
    messageApi.open({
      type: "success",
      content: "Sign out successfully!",
    });
  };

  const items = [
    {
      key: "products",
      label: "Products",
      children: <ProductsTab />,
    },
    {
      key: "orders",
      label: "Orders",
      children: <OrdersTab />,
    },
    {
      key: "customers",
      label: "Customers",
      children: <CustomersTab />,
    },
  ];

  return (
    <Layout className={styles.adminLayout}>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      {contextHolder}
      <Header className={styles.header}>
        <div className={styles.logo}>Admin Dashboard</div>
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          className={styles.signOutButton}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Header>
      <Content className={styles.content}>
        <div className={styles.details}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </div>
      </Content>
    </Layout>
  );
}
