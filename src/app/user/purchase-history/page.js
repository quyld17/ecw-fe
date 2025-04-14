"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import NavigationBar from "../../../component/navigation-bar/index";
import {
  columns,
  handleOrders,
  handleOrderProducts,
} from "../../../component/user/purchase-history/orders-table";
import UserSideBar from "../../../component/user/side-bar/page";
import { handleGetOrdersAPI } from "../../../api/handlers/order";

import styles from "./styles.module.css";
import { Table } from "antd";

export default function PurchaseHistory() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }

    handleGetOrdersAPI()
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.log("Error getting delivery address: ", error);
      });
  }, []);

  const orderData = handleOrders(orders);

  return (
    <div>
      <Head>
        <title>Purchase History</title>
      </Head>
      <NavigationBar />
      <div className={styles.content}>
        <UserSideBar />
        <div className={styles.orders}>
          <Table
            size="large"
            showHeader={true}
            tableLayout="fixed"
            pagination={true}
            expandable={{
              expandedRowRender: (record) =>
                handleOrderProducts(record, orders),
              defaultExpandedRowKeys: [0],
            }}
            columns={columns}
            dataSource={orderData}
          ></Table>
        </div>
      </div>
    </div>
  );
}
