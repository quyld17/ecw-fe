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
import {
  handleGetUserDetailsAPI,
  handleGetAddressesAPI,
  handleGetDefaultAddressAPI,
  handleUpdateAddressAPI,
  handleAddAddressAPI,
} from "../../api/handlers/user";
import { handleGetCartSelectedProductsAPI } from "../../api/handlers/cart";
import cartEvents from "../../utils/events";

import {
  Table,
  Radio,
  Space,
  Button,
  message,
  Modal,
  List,
  Form,
  Input,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

export default function CheckOut() {
  const [checkOutData, setCheckOutData] = useState([]);
  const [userInfo, setUserInfo] = useState();
  const [address, setAddress] = useState();
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [subTotal, setSubTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [addresses, setAddresses] = useState([]);
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm] = Form.useForm();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

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
        messageApi.open({
          type: "error",
          content: "Error getting check-out products' details: " + error,
        });
      });

    Promise.all([
      handleGetUserDetailsAPI(),
      handleGetDefaultAddressAPI(),
      handleGetAddressesAPI(),
    ])
      .then(([userData, defaultAddressData, addressesData]) => {
        setUserInfo(userData.user);
        setAddress(defaultAddressData);
        setAddresses(addressesData || []);
      })
      .catch((error) => {});
  }, []);

  const handlePlaceOrder = async (paymentMethod) => {
    try {
      if (!address) {
        messageApi.open({
          type: "error",
          content: "Please add a delivery address before placing your order.",
        });
        return;
      }

      if (!userInfo?.full_name || !userInfo?.phone_number) {
        setIsProfileModalVisible(true);
        return;
      }

      setIsLoading(true);
      const data = await handleCreateOrderAPI(paymentMethod, address.Address);

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
      messageApi.open({
        type: "error",
        content: "Failed to place order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const addressesData = await handleGetAddressesAPI();
      setAddresses(addressesData || []);
    } catch (error) {
      setAddresses([]);
    }
  };

  const showAddressModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      addressForm.setFieldsValue({
        Name: address.Name || "",
        Address: address.Address || "",
      });
    } else {
      addressForm.resetFields();
    }
    setIsAddressModalVisible(true);
  };

  const handleAddOrUpdateAddress = async (values) => {
    try {
      let updatedAddress = null;
      if (editingAddress) {
        await handleUpdateAddressAPI(editingAddress.AddressID, values);
        messageApi.open({
          type: "success",
          content: "Address updated successfully!",
        });
        updatedAddress = { ...editingAddress, ...values };
      } else {
        const response = await handleAddAddressAPI(values);
        messageApi.open({
          type: "success",
          content: "Address added successfully!",
        });

        const addressesData = await handleGetAddressesAPI();
        updatedAddress = addressesData.find(
          (addr) => addr.Name === values.Name && addr.Address === values.Address
        );
      }

      setIsAddressModalVisible(false);
      setEditingAddress(null);
      addressForm.resetFields();

      const addressesData = await handleGetAddressesAPI();
      setAddresses(addressesData || []);

      if (updatedAddress) {
        setAddress(updatedAddress);
      } else {
        messageApi.open({
          type: "error",
          content:
            "Address saved but failed to update display. Please refresh the page.",
        });
      }

      if (!editingAddress) {
        setShowAddressSelect(false);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to save address. Please try again.",
      });
    }
  };

  return (
    <div className={styles.layout}>
      <Head>
        <title>Check Out</title>
      </Head>
      <NavigationBar />
      {contextHolder}

      <Modal
        title="Profile Update Required"
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsProfileModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={() => router.push("/user/profile")}
          >
            Update now
          </Button>,
        ]}
      >
        <p style={{ fontSize: "16px", marginBottom: "16px" }}>
          Please update your profile with the following information before
          placing your order:
        </p>
        <ul style={{ color: "#ff4d4f", marginBottom: "16px" }}>
          {!userInfo?.full_name && <li>Full Name</li>}
          {!userInfo?.phone_number && <li>Phone Number</li>}
        </ul>
      </Modal>

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
        {address ? (
          <>
            {address.Name && address.Address ? (
              <div>
                <p className={styles.addressInfo}>
                  {userInfo && userInfo.full_name}
                </p>
                <p className={styles.addressInfo}>
                  {userInfo && userInfo.phone_number}
                </p>
                <div
                  className={styles.addressInfo}
                  style={{ fontWeight: "bold" }}
                >
                  {address.Name}
                </div>
                <div className={styles.addressInfo}>{address.Address}</div>
              </div>
            ) : (
              <div className={styles.addressInfo}>
                Error: Invalid address format
              </div>
            )}

            <Button
              type="primary"
              className={styles.selectAddressButton}
              onClick={() => setShowAddressSelect(true)}
            >
              Change address
            </Button>
          </>
        ) : (
          <div>
            <p className={styles.addressInfo}>No delivery address set</p>
            <Button
              type="primary"
              className={styles.selectAddressButton}
              onClick={() => showAddressModal()}
            >
              Add address
            </Button>
          </div>
        )}

        {/* Address Selection Modal */}
        <Modal
          title="Select Delivery Address"
          open={showAddressSelect}
          onCancel={() => setShowAddressSelect(false)}
          footer={null}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAddressModal()}
            style={{ marginBottom: 16 }}
          >
            Add New Address
          </Button>
          {addresses.length > 0 ? (
            <List
              dataSource={addresses}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => showAddressModal(item)}
                      key="edit"
                    >
                      Edit
                    </Button>,
                    <Button
                      type={
                        address && address.AddressID === item.AddressID
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setAddress(item);
                        setShowAddressSelect(false);
                      }}
                      key="select"
                    >
                      {address && address.AddressID === item.AddressID
                        ? "Selected"
                        : "Select"}
                    </Button>,
                  ]}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {item.Name}
                    </div>
                    <div>{item.Address}</div>
                    {item.IsDefault === 1 && (
                      <span style={{ color: "green", marginLeft: 8 }}>
                        (Default)
                      </span>
                    )}
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p>No addresses found. Please add a new address.</p>
            </div>
          )}
        </Modal>

        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          open={isAddressModalVisible}
          onOk={() => addressForm.submit()}
          onCancel={() => {
            setIsAddressModalVisible(false);
            setEditingAddress(null);
            addressForm.resetFields();
          }}
        >
          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleAddOrUpdateAddress}
          >
            <Form.Item
              name="Name"
              label="Address Name"
              rules={[
                { required: true, message: "Please input address name!" },
              ]}
            >
              <Input placeholder="e.g., Home, Office, etc." />
            </Form.Item>
            <Form.Item
              name="Address"
              label="Address"
              rules={[{ required: true, message: "Please input address!" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter your full address" />
            </Form.Item>
          </Form>
        </Modal>
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
