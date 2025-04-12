"use client";

import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/navigation";
import validator from "validator";

import { handleSignUpAPI } from "../../api/handlers/sign-up";
import styles from "./styles.module.css";

import { Layout, Form, Input, Button, message } from "antd";
const { Content, Header } = Layout;

const signUpValidate = (email, password, confirmPassword) => {
  if (!email) {
    return "Email must not be empty! Please try again";
  } else if (!password) {
    return "Password must not be empty! Please try again";
  } else if (!confirmPassword) {
    return "Confirm password must not be empty! Please try again";
  } else if (!validator.isEmail(email)) {
    return "Invalid email address! Email must include '@' and a domain";
  } else if (password !== confirmPassword) {
    return "Passwords not matched! Please try again";
  }
  return null;
};

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const handleSignUp = (e) => {
    e.preventDefault();
    const errorMessage = signUpValidate(email, password, confirmPassword);
    if (errorMessage) {
      messageApi.open({
        type: "error",
        content: errorMessage,
      });
      return;
    }

    handleSignUpAPI(email, password)
      .then(() => {
        router.push("/sign-up-complete");
      })
      .catch((error) => {
        message.error(error);
      });
  };

  return (
    <Layout>
      {contextHolder}
      <Head>
        <title>Sign Up</title>
      </Head>

      <Header className={styles.navigationBar}>
        <div className={styles.websiteLogo}>
          <Link href="/">Logo</Link>
        </div>
      </Header>

      <Layout className={styles.mainPage}>
        <Content className={styles.content}>
          <Form
            labelCol={{ span: 7 }}
            className={styles.signUpForm}
            autoComplete="off"
          >
            <p className={styles.signUpTitle}>Sign up</p>
            <Form.Item label="Email" name="email" required>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Password" name="password" required>
              <Input.Password
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="confirm password"
              required
            >
              <Input.Password
                type="password"
                name="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item className={styles.signUpButton}>
              <Button type="primary" htmlType="submit" onClick={handleSignUp}>
                Sign up
              </Button>
            </Form.Item>

            <p className={styles.alreadyHadAnAccount}>
              Already had an account?{" "}
              <Link className={styles.signInButton} href="/sign-in">
                Sign In
              </Link>
            </p>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
}
