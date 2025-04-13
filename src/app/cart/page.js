"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

import NavigationBar from "../../component/navigation-bar/index";
import { handleGetCartProducts } from "../../component/cart/get-products";
import {
  cartColumns,
  cartData,
} from "../../component/cart/product-table/index";
import { handleCancel, handleOk } from "../../component/cart/delete-confirm";
import { handleAdjustQuantity } from "../../component/cart/adjust-quantity";
import { handleSelectProducts } from "../../component/cart/select-products";

import styles from "./styles.module.css";

import { Button, Table, Modal, message } from "antd";

export default function CartPage() {
  const [cartProducts, setCartProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowKeysPrev, setSelectedRowKeysPrev] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/sign-in");
      return;
    }

    handleGetCartProducts(
      setCartProducts,
      setTotal,
      setSelectedRowKeys,
      setSelectedRowKeysPrev
    );
  }, []);

  const handleProductRedirect = (id, router) => {
    router.push(`/product/${id}`);
  };

  const adjustedQuantityHandler = (id, quantity) => {
    handleAdjustQuantity(
      id,
      quantity,
      cartProducts,
      setCartProducts,
      setTotal,
      setSelectedRowKeys,
      setSelectedRowKeysPrev,
      setIsModalOpen,
      setDeletingProduct
    );
  };

  const data = cartData(
    cartProducts,
    handleProductRedirect,
    adjustedQuantityHandler
  );

  const handleSelectedProducts = (selectedRowKeys) => {
    handleSelectProducts(
      cartProducts,
      selectedRowKeys,
      selectedRowKeysPrev,
      setCartProducts,
      setTotal,
      setSelectedRowKeys,
      setSelectedRowKeysPrev
    );
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: handleSelectedProducts,
  };

  const handleCheckOut = (router, selectedRowKeys) => {
    if (selectedRowKeys.length === 0) {
      messageApi.open({
        type: "error",
        content:
          "You have not selected anything for check out. Please try again",
      });
      return;
    } else {
      router.push("/check-out");
    }
  };

  return (
    <div className={styles.layout}>
      {contextHolder}
      <Head>
        <title>Cart</title>
      </Head>
      <NavigationBar />

      <Modal
        title="Do you want to remove this item?"
        open={isModalOpen}
        onOk={() =>
          handleOk(
            deletingProduct,
            setIsModalOpen,
            setCartProducts,
            setTotal,
            setSelectedRowKeys,
            setSelectedRowKeysPrev
          )
        }
        onCancel={() => handleCancel(setIsModalOpen)}
      >
        <p>{deletingProduct && deletingProduct.product_name}</p>
      </Modal>

      <div className={styles.content}>
        <Table
          size="large"
          showHeader={true}
          rowSelection={rowSelection}
          tableLayout="fixed"
          pagination={false}
          columns={cartColumns}
          dataSource={data}
          className={styles.table}
        ></Table>

        <div className={styles.checkoutBar}>
          <div className={styles.checkoutBarTotal}>
            <p>Total:</p>
            <p>
              {Intl.NumberFormat("vi-VI", {
                style: "currency",
                currency: "VND",
              }).format(total || 0)}
            </p>
          </div>
          <div className={styles.checkoutButtonField}>
            <Button
              className={styles.checkOutButton}
              type="primary"
              onClick={() => handleCheckOut(router, selectedRowKeys)}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
