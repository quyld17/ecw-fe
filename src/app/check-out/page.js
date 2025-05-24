"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import NavigationBar from "../../component/navigation-bar/index";
import styles from "./styles.module.css";
import {
  checkOutColumns,
  handleCheckOutData,
} from "../../component/check-out/product-table";
import { handleCreateOrderAPI } from "../../api/handlers/order";
import { handleGetUserDetailsAPI } from "../../api/handlers/user";
import { handleGetCartSelectedProductsAPI } from "../../api/handlers/cart";
import { handleGetDefaultAddressAPI } from "../../api/handlers/user";
import cartEvents from "../../utils/events";

import { Table, Radio, Space, Button, message } from "antd";

export default function CheckOut() {
  const [checkOutData, setCheckOutData] = useState([]);
  const [userInfo, setUserInfo] = useState();
  const [address, setAddress] = useState();
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [subTotal, setSubTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();

  const handlePaymentMethodSelect = (e) => {
    setPaymentMethod(e.target.value);
  };

  const data = handleCheckOutData(checkOutData);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }

    handleGetCartSelectedProductsAPI()
      .then((data) => {
        if (data.cart_products.length === 0) {
          messageApi.open({
            type: "error",
            content: "You have not selected any products for checkout",
          });
          router.push("/");
        }
        setCheckOutData(data.cart_products);
        setSubTotal(data.total_price);
      })
      .catch((error) => {
        console.log("Error getting check-out products' details:", error);
      });

    // Fetch user info and default address in parallel
    Promise.all([
      handleGetUserDetailsAPI(),
      handleGetDefaultAddressAPI()
    ])
      .then(([userData, defaultAddressData]) => {
        setUserInfo(userData.user);
        setAddress(defaultAddressData);
      })
      .catch((error) => {
        console.log("Error getting user or default address: ", error);
      });
  }, []);

  const handlePlaceOrder = async (paymentMethod) => {
    try {
      setIsLoading(true);
      const data = await handleCreateOrderAPI(paymentMethod);
      
      if (data.message) {
        messageApi.open({
          type: "error",
          content: data.message,
        });
      } else {
        cartEvents.emit();
        messageApi.open({
          type: "success",
          content: "Order placed successfully!",
        });
        router.push("/check-out/complete");
      }
    } catch (error) {
      console.log("Place order unsuccessfully: ", error);
      messageApi.open({
        type: "error",
        content: "Failed to place order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Head>
        <title>Check Out</title>
      </Head>
      <NavigationBar />
      {contextHolder}

      <div className={styles.productsField}>
        <Table
          size="large"
          showHeader={true}
          tableLayout="fixed"
          pagination={false}
          columns={checkOutColumns}
          dataSource={data}
        ></Table>
      </div>

      <div className={styles.deliveryAddressField}>
        <p className={styles.deliveryAddressTitle}>Delivery Address</p>
        <p>{userInfo && userInfo.full_name}</p>
        <p>{userInfo && userInfo.phone_number}</p>
        {address && (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{address.Name}</div>
            <div>{address.Address}</div>
          </div>
        )}
      </div>

      <div className={styles.paymentField}>
        <p className={styles.paymentMethodTitle}>Payment Method</p>
        <Radio.Group value={paymentMethod} onChange={handlePaymentMethodSelect}>
          <Space direction="vertical">
            <Radio
              className={styles.paymentMethodSelectField}
              value="Cash on Delivery"
            >
              Cash on Delivery
            </Radio>
            <Radio
              className={styles.paymentMethodSelectField}
              value="Bank Transfer"
            >
              Bank Transfer
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      <div className={styles.totalField}>
        <div className={styles.textField}>
          <div className={styles.subtotal}>
            <p>Subtotal:</p>
            <p>
              {Intl.NumberFormat("vi-VI", {
                style: "currency",
                currency: "VND",
              }).format(subTotal)}
            </p>
          </div>
          <div className={styles.shippingTotal}>
            <p>Shipping Total: </p>
            <p>
              {Intl.NumberFormat("vi-VI", {
                style: "currency",
                currency: "VND",
              }).format(0)}
            </p>
          </div>
          <div className={styles.total}>
            <p>Total:</p>
            <p>
              {Intl.NumberFormat("vi-VI", {
                style: "currency",
                currency: "VND",
              }).format(subTotal + 0)}
            </p>
          </div>
        </div>

        <div className={styles.placeOrderButtonField}>
          <Button
            type="primary"
            onClick={() => handlePlaceOrder(paymentMethod)}
            loading={isLoading}
            className={styles.placeOrderButton}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
