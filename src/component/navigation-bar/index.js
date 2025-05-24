"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import styles from "./styles.module.css";
import { handleGetAllCartProductsAPI } from "../../api/handlers/cart";
import cartEvents from "../../utils/events";

import { ShoppingCartOutlined } from "@ant-design/icons";
import { BiUserCircle } from "react-icons/bi";
import { Input, Layout, Dropdown, Badge, message } from "antd";

const { Search } = Input;
const { Header } = Layout;

export default function NavigationBar() {
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [cartProductsCount, setCartProductsCount] = useState(0);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const updateCartCount = () => {
    if (token) {
      handleGetAllCartProductsAPI()
        .then((data) => {
          const activeProducts = data.cart_products.filter(product => product.quantity > 0);
          setCartProductsCount(activeProducts.length);
        })
        .catch((error) => {
          console.log("Error updating cart count: ", error);
        });
    } else {
      setCartProductsCount(0);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      const expTime = decodedToken.exp;
      const currentTime = Date.now() / 1000;

      if (currentTime > expTime) {
        messageApi.open({
          type: "info",
          content: "Session expired! Please sign in to continue",
        });
        handleSignOut();
      } else {
        const userEmail = decodedToken.email;
        setUserEmail(userEmail);
        updateCartCount();
      }
    }
  }, []);

  // Subscribe to cart update events
  useEffect(() => {
    cartEvents.subscribe(updateCartCount);
    return () => cartEvents.unsubscribe(updateCartCount);
  }, [token]);

  // Update cart count whenever the route changes
  useEffect(() => {
    updateCartCount();
  }, [router.asPath, token]);

  const handleCartLogoClick = () => {
    if (!token) {
      router.push("/sign-in");
    } else {
      router.push("/cart");
    }
  };

  // Clear JWT token and user's email local storage after signing out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserEmail("");
    setCartProductsCount(0);
    router.push("/");
    messageApi.open({
      type: "success",
      content: "Sign out successfully!",
    });
  };

  const items = [
    {
      key: "1",
      label: <Link href="/sign-in">Sign in</Link>,
    },
    {
      key: "2",
      label: <Link href="/sign-up">Sign up</Link>,
    },
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.websiteLogo}>
        <Link href="/">Logo</Link>
      </div>

      <Search placeholder="input search text" className={styles.searchBar} />

      <div>
        <Badge
          showZero
          size="small"
          count={cartProductsCount}
          offset={[-20, 25]}
        >
          <ShoppingCartOutlined
            className={styles.cartLogo}
            onClick={handleCartLogoClick}
          />
        </Badge>
      </div>

      {token ? (
        <Dropdown
          menu={{
            items: [
              {
                key: "3",
                label: <Link href="/user/profile">Profile</Link>,
              },
              {
                key: "4",
                label: (
                  <Link href="/user/purchase-history">Purchase History</Link>
                ),
              },
              {
                key: "5",
                label: <span onClick={handleSignOut}>Sign out</span>,
              },
            ],
          }}
          trigger={["click", "hover"]}
          placement="bottom"
        >
          <p className={styles.userEmail}>{userEmail}</p>
        </Dropdown>
      ) : (
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottom">
          <div className={styles.userLogoWrapper}>
            <BiUserCircle className={styles.userLogo} />
          </div>
        </Dropdown>
      )}
    </Header>
  );
}
