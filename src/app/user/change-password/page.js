"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { handleChangePasswordAPI } from "../../../api/handlers/user";
import UserSideBar from "../../../component/user/side-bar/page";
import NavigationBar from "../../../component/navigation-bar/index";
import styles from "./styles.module.css";

import { Form, Input, Button, message } from "antd";

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
  }
};

export default function ChangePassword() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }
  }, []);

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
          // Reset form after successful password change
          form.resetFields();
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

  return (
    <div>
      {contextHolder}
      <Head>
        <title>Change Password</title>
      </Head>
      <NavigationBar />
      <div className={styles.content}>
        <UserSideBar />
        <div className={styles.details}>
          <p className={styles.changePasswordTitle}>Change Password</p>

          <Form
            form={form}
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 8,
            }}
            layout="horizontal"
            style={{ maxWidth: 1000 }}
            onFinish={handlePasswordChange}
            initialValues={{
              password: "",
              new_password: "",
              confirm_password: ""
            }}
          >
            <Form.Item 
              label="Current password"
              name="password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item 
              label="New password" 
              name="new_password"
              rules={[{ required: true, message: 'Please input your new password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item 
              label="Confirm password" 
              name="confirm_password"
              rules={[{ required: true, message: 'Please confirm your new password!' }]}
            >
              <Input.Password />
            </Form.Item>
            
            <Form.Item wrapperCol={{ offset: 5, span: 8 }}>
              <Button
                className={styles.changePasswordButton}
                type="primary"
                htmlType="submit"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
