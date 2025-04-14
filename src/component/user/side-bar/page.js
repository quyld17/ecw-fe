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
      <div className={styles.profile}>
        <Link href="/user/profile">Profile</Link>
      </div>
      <div className={styles.purchase}>
        <Link href="/user/purchase-history">Purchase History</Link>
      </div>
      <div className={styles.changePassword}>
        <Link href="/user/change-password">Change Password</Link>
      </div>
    </div>
  );
}
