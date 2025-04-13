"use client";

import styles from "./page.module.css";
import ProductsDisplay from "./products-display/index";
import NavigationBar from "../component/navigation-bar/index";
import SideBar from "../component/side-bar/index";

import "@ant-design/v5-patch-for-react-19";
import Head from "next/head";
import { Layout } from "antd";
const { Content } = Layout;

export default function Home() {
  return (
    <Layout className={styles.mainLayout}>
      <Head>
        <title>E-Commerce Website</title>
      </Head>
      <NavigationBar />
      <Layout className={styles.body}>
        <SideBar />
        <Layout className={styles.contentLayout}>
          <Content className={styles.content}>
            <ProductsDisplay />
            <p>Hello</p>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
