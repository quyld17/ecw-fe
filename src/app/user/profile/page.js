"use client";
import "@ant-design/v5-patch-for-react-19";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

import {
  handleGetUserDetailsAPI,
  handleUpdateUserDetailsAPI,
  handleGetAddressesAPI,
  handleAddAddressAPI,
  handleUpdateAddressAPI,
  handleSetDefaultAddressAPI,
  handleDeleteAddressAPI,
  handleChangePasswordAPI,
} from "../../../api/handlers/user";

import UserSideBar from "../../../component/user/side-bar/page";
import NavigationBar from "../../../component/navigation-bar/index";
import styles from "./styles.module.css";

import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Layout,
  Tabs,
  Modal,
  Checkbox,
  List,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export default function Profile() {
  const [user, setUser] = useState();
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const router = useRouter();
  const dateFormat = "YYYY-MM-DD";
  const backendDateFormat = "YYYY-MM-DDTHH:mm:ssZ";
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [changePasswordForm] = Form.useForm();

  const fetchAddresses = async () => {
    try {
      const data = await handleGetAddressesAPI();
      if (data && Array.isArray(data)) {
        const sortedAddresses = data.sort((a, b) => {
          if (a.is_default) return -1;
          if (b.is_default) return 1;
          return 0;
        });
        setAddresses(sortedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      setAddresses([]);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }

    handleGetUserDetailsAPI()
      .then((data) => {
        setUser(data.user);
        let dateOfBirth = null;
        if (data.user.date_of_birth_display) {
          dateOfBirth = dayjs(data.user.date_of_birth_display);
          if (!dateOfBirth.isValid()) {
            dateOfBirth = null;
            console.warn(
              "Invalid date format received:",
              data.user.date_of_birth_display
            );
          }
        }

        form.setFieldsValue({
          full_name: data.user.full_name || "",
          phone_number: data.user.phone_number || "",
          gender: data.user.gender === 1 ? "male" : "female",
          date_of_birth: dateOfBirth,
        });
      })
      .catch((error) => {
        console.log("Error: ", error);
      });

    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (values) => {
    try {
      const formattedDate = values.date_of_birth
        ? values.date_of_birth
            .hour(12)
            .minute(0)
            .second(0)
            .utc()
            .format(backendDateFormat)
        : null;

      const userDetails = {
        full_name: values.full_name,
        phone_number: values.phone_number,
        gender: values.gender === "male" ? 1 : 2,
        date_of_birth: formattedDate,
      };

      await handleUpdateUserDetailsAPI(userDetails);
      messageApi.open({
        type: "success",
        content: "Profile updated successfully!",
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to update profile",
      });
    }
  };

  const handleAddOrUpdateAddress = async (values) => {
    try {
      if (editingAddress) {
        await handleUpdateAddressAPI(editingAddress.AddressID, values);
        messageApi.open({
          type: "success",
          content: "Address updated successfully!",
        });
      } else {
        await handleAddAddressAPI(values);
        messageApi.open({
          type: "success",
          content: "Address added successfully!",
        });
      }
      setIsAddressModalVisible(false);
      addressForm.resetFields();
      setEditingAddress(null);
      await fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      messageApi.open({
        type: "error",
        content: "Failed to save address",
      });
    }
  };

  const handleDeleteAddress = async (addressId, isDefault) => {
    if (isDefault) {
      messageApi.open({
        type: "warning",
        content:
          "The default address cannot be deleted. Please set another address as default before deleting this one.",
      });
      return;
    }
    Modal.confirm({
      title: "Are you sure you want to delete this address?",
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        handleDeleteAddressAPI(addressId)
          .then(() => {
            messageApi.open({
              type: "success",
              content: "Address deleted successfully!",
            });
            fetchAddresses();
          })
          .catch((error) => {
            console.error("Error deleting address:", error);
            messageApi.open({
              type: "error",
              content: "Failed to delete address",
            });
          }),
    });
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await handleSetDefaultAddressAPI(addressId);
      messageApi.open({
        type: "success",
        content: "Default address updated successfully!",
      });
      await fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
      messageApi.open({
        type: "error",
        content: "Failed to update default address",
      });
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

  const credentialsValidate = (user, messageApi) => {
    const formValidate = () => {
      if (user.password === "") {
        return "Current password must not be empty! Please try again";
      } else if (user.new_password === "") {
        return "New password must not be empty! Please try again";
      } else if (user.confirm_password === "") {
        return "Confirm password must not be empty! Please try again";
      } else if (user.new_password !== user.confirm_password) {
        return "Passwords not matched! Please try again";
      } else if (user.password === user.new_password) {
        return "New password must be different from current password! Please try again";
      }
      return null;
    };

    const validationError = formValidate();
    if (validationError) {
      messageApi.open({
        type: "error",
        content: validationError,
      });
      return true;
    }
    return false;
  };

  const handlePasswordChange = async (values) => {
    if (!credentialsValidate(values, messageApi)) {
      try {
        const data = await handleChangePasswordAPI(values);
        if (typeof data === "object") {
          messageApi.open({
            type: "error",
            content: "Wrong password",
          });
        } else {
          messageApi.open({
            type: "success",
            content: data,
          });
          changePasswordForm.resetFields();
        }
      } catch (error) {
        if (typeof error === "object") {
          messageApi.open({
            type: "error",
            content: error.message || "An error occurred.",
          });
        } else {
          messageApi.open({
            type: "error",
            content: error,
          });
        }
      }
    }
  };

  const items = [
    {
      key: "1",
      label: "Profile Information",
      children: (
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          layout="horizontal"
          style={{ maxWidth: 1000 }}
          onFinish={handleUpdateProfile}
          initialValues={{
            full_name: "",
            phone_number: "",
            gender: "male",
            date_of_birth: null,
          }}
        >
          <Form.Item label="Email">{user?.email}</Form.Item>
          <Form.Item
            label="Name"
            name="full_name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select your gender!" }]}
          >
            <Select>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Date of birth"
            name="date_of_birth"
            rules={[
              { required: true, message: "Please select your date of birth!" },
            ]}
          >
            <DatePicker
              format={dateFormat}
              allowClear={false}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.saveChangesButton}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "Address Information",
      children: (
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showAddressModal()}
            style={{ marginBottom: 16 }}
          >
            Add New Address
          </Button>

          <List
            dataSource={addresses}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Space key="actions">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => showAddressModal(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() =>
                        handleDeleteAddress(
                          item.AddressID,
                          item.IsDefault === 1
                        )
                      }
                    >
                      Delete
                    </Button>
                    <Checkbox
                      checked={item.IsDefault === 1}
                      onChange={() => handleSetDefaultAddress(item.AddressID)}
                    >
                      Default Address
                    </Checkbox>
                  </Space>,
                ]}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                    {item.Name}
                  </div>
                  <div>{item.Address}</div>
                </div>
              </List.Item>
            )}
          />

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
                <Input.TextArea
                  rows={4}
                  placeholder="Enter your full address"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      ),
    },
    {
      key: "3",
      label: "Change Password",
      children: (
        <div>
          <Form
            form={changePasswordForm}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            style={{ maxWidth: 1000 }}
            onFinish={handlePasswordChange}
            initialValues={{
              password: "",
              new_password: "",
              confirm_password: "",
            }}
          >
            <Form.Item
              label="Current password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your current password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="New password"
              name="new_password"
              rules={[
                { required: true, message: "Please input your new password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="confirm_password"
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 5, span: 8 }}>
              <Button
                className={styles.saveChangesButton}
                type="primary"
                htmlType="submit"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Layout className={styles.mainLayout}>
      {contextHolder}
      <Head>
        <title>Account Profile</title>
      </Head>
      <NavigationBar />
      <div className={styles.content}>
        <UserSideBar />
        <div className={styles.details}>
          <p className={styles.profileTitle}>My Profile</p>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </div>
      </div>
    </Layout>
  );
}
