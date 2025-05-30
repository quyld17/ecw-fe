"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/navigation";
import validator from "validator";

import styles from "./styles.module.css";
import handleSignInAPI from "../../api/handlers/sign-in";

import { Layout, theme, Form, Input, Button, message } from "antd";

const { Content, Header } = Layout;

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!credentialsValidate(email, password)) {
      handleSignInAPI(email, password)
        .then((data) => {
          const token = data.token;
          localStorage.setItem("token", token);

          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));

          if (payload.role === "Admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        })
        .catch((error) => {
          messageApi.open({
            type: "error",
            content: error,
          });
        });
    }
  };

  const credentialsValidate = (email, password) => {
    const formValidate = () => {
      if (!email) {
        return "Email must not be empty! Please try again";
      } else if (!password) {
        return "Password must not be empty! Please try again";
      } else if (!validator.isEmail(email) && email !== "admin") {
        return "Invalid email address! Email must include '@' and a domain";
      }
      return null;
    };

    const validationError = formValidate();
    if (validationError) {
      messageApi.open({
        type: "error",
        content: validationError,
      });
      return;
    }
  };

  return (
    <Layout>
      {contextHolder}
      <Head>
        <title>Sign In</title>
      </Head>

      <Header className={styles.navigationBar}>
        <div className={styles.websiteLogo}>
          <Link href="/">Logo</Link>
        </div>
      </Header>
      <Layout
        style={{
          background: colorBgContainer,
          padding: 24,
          margin: 0,
          minHeight: 280,
        }}
      >
        <Content className={styles.content}>
          <Form
            labelCol={{ span: 6 }}
            className={styles.signInForm}
            autoComplete="off"
          >
            <p className={styles.signInTitle}>Sign in</p>
            <Form.Item label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Password">
              <Input.Password
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <p className={styles.forgotPassword}>Forgot Password</p>

            <Form.Item className={styles.signInButton}>
              <Button type="primary" htmlType="submit" onClick={handleSignIn}>
                Sign in
              </Button>
            </Form.Item>

            <p className={styles.createAccount}>
              Don&#39;t have an account?{" "}
              <Link className={styles.signUp} href="/sign-up">
                Sign Up
              </Link>
            </p>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
}
