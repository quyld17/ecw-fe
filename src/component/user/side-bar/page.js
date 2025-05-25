"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

import styles from "./styles.module.css";

export default function UserSideBar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const decodedToken = jwtDecode(storedToken);
    const userEmail = decodedToken.email;
    setEmail(userEmail);
  }, []);

  return (
    <div className={styles.sideBar}>
      <div className={styles.email}>{email}</div>
      <Link href="/user/profile">
        <div className={styles.profile}>Profile</div>
      </Link>
      <div className={styles.sidebarDivider}></div>
      <Link href="/user/purchase-history">
        <div className={styles.purchase}>Purchase History</div>
      </Link>
    </div>
  );
}
