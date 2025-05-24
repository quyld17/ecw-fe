"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

import { handleGetUserDetailsAPI, handleUpdateUserDetailsAPI } from "../../../api/handlers/user";

import UserSideBar from "../../../component/user/side-bar/page";
import NavigationBar from "../../../component/navigation-bar/index";
import styles from "./styles.module.css";

import { Form, Input, Select, DatePicker, Button, message, Layout, Tabs } from "antd";

// Add dayjs plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export default function Profile() {
  const [user, setUser] = useState();
  const [address, setAddress] = useState();
  const [activeTab, setActiveTab] = useState('1');
  const router = useRouter();
  const dateFormat = "YYYY-MM-DD";
  const backendDateFormat = "YYYY-MM-DDTHH:mm:ssZ";
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }

    handleGetUserDetailsAPI()
      .then((data) => {
        setUser(data.user);
        setAddress(data.address);
        
        // Parse the date string safely
        let dateOfBirth = null;
        if (data.user.date_of_birth_string) {
          dateOfBirth = dayjs(data.user.date_of_birth_string);
          if (!dateOfBirth.isValid()) {
            dateOfBirth = null;
            console.warn("Invalid date format received:", data.user.date_of_birth_string);
          }
        }

        // Reset form with new values
        form.setFieldsValue({
          full_name: data.user.full_name || '',
          phone_number: data.user.phone_number || '',
          gender: data.user.gender === 1 ? "male" : "female",
          date_of_birth: dateOfBirth
        });

        if (data.address) {
          // Reset address form with new values
          addressForm.setFieldsValue({
            address: data.address.house_number + ", " + data.address.street + ", " + 
                    data.address.ward + ", " + data.address.district + ", " + data.address.city
          });
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }, []);

  const handleUpdateProfile = async (values) => {
    try {
      // Set the time to 12:00 UTC to avoid date shifts across timezones
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
        date_of_birth: formattedDate
      };

      await handleUpdateUserDetailsAPI(userDetails);
      messageApi.open({
        type: "success",
        content: "Profile updated successfully!",
      });
    } catch (error) {
      // console.error("Error updating profile:", error);
      messageApi.open({
        type: "error",
        content: "Failed to update profile",
      });
    }
  };

  const items = [
    {
      key: '1',
      label: 'Profile Information',
      children: (
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          layout="horizontal"
          style={{ maxWidth: 1000 }}
          onFinish={handleUpdateProfile}
          initialValues={{
            full_name: '',
            phone_number: '',
            gender: 'male',
            date_of_birth: null
          }}
        >
          <Form.Item label="Email">
            {user?.email}
          </Form.Item>
          <Form.Item 
            label="Name" 
            name="full_name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="Phone Number" 
            name="phone_number"
            rules={[{ required: true, message: 'Please input your phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="Gender" 
            name="gender"
            rules={[{ required: true, message: 'Please select your gender!' }]}
          >
            <Select>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            label="Date of birth" 
            name="date_of_birth"
            rules={[{ required: true, message: 'Please select your date of birth!' }]}
          >
            <DatePicker 
              format={dateFormat} 
              allowClear={false}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 10 }}>
            <Button type="primary" htmlType="submit" className={styles.saveChangesButton}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: 'Address Information',
      children: (
        <Form
          form={addressForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          layout="horizontal"
          style={{ maxWidth: 1000 }}
          initialValues={{
            address: ''
          }}
        >
          <Form.Item 
            label="Address" 
            name="address"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 10 }}>
            <Button type="primary" className={styles.saveChangesButton}>
              Save Address
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Layout>
      {contextHolder}
      <Head>
        <title>Account Profile</title>
      </Head>
      <NavigationBar />
      <div className={styles.content}>
        <UserSideBar />
        <div className={styles.details}>
          <p className={styles.profileTitle}>My Profile</p>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={items} 
          />
        </div>
      </div>
    </Layout>
  );
}
