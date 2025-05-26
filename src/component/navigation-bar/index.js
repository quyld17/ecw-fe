"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";

import styles from "./styles.module.css";
import { handleGetAllCartProductsAPI } from "../../api/handlers/cart";
import { handleSearchProductsAPI } from "../../api/handlers/products";
import cartEvents from "../../utils/events";

import { ShoppingCartOutlined, ShopOutlined } from "@ant-design/icons";
import { BiUserCircle } from "react-icons/bi";
import { Input, Layout, Dropdown, Badge, message} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Header } = Layout;

export default function NavigationBar() {
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [cartProductsCount, setCartProductsCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef();
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

  useEffect(() => {
    cartEvents.subscribe(updateCartCount);
    return () => cartEvents.unsubscribe(updateCartCount);
  }, [token]);

  useEffect(() => {
    updateCartCount();
  }, [router.asPath, token]);

  useEffect(() => {
    if (!searchText) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearchProductsAPI(searchText)
        .then(data => {
          setSearchResults(data);
          setShowDropdown(true);
        })
        .catch(() => {
          setSearchResults([]);
          setShowDropdown(false);
        })
        .finally(() => setIsSearching(false));
    }, 1000);
    return () => clearTimeout(debounceRef.current);
  }, [searchText]);

  const handleCartLogoClick = () => {
    if (!token) {
      router.push("/sign-in");
    } else {
      router.push("/cart");
    }
  };

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
      {contextHolder}
      <div className={styles.websiteLogo}>
        <Link href="/"><ShopOutlined style={{ fontSize: 40 }} /></Link>
      </div>

      <div style={{ position: "relative", width: "600px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Search
            placeholder="input search text"
            className={styles.searchBar}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            enterButton
            suffix={isSearching ? <span style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}><LoadingOutlined style={{ fontSize: 20, color: '#1890ff' }} spin /></span> : null}
            allowClear
          />
        </div>
        {showDropdown && searchResults.length > 0 && (
          <div className={styles.searchDropdown}>
            {searchResults.map(item => (
              <div
                key={item.product_id}
                className={styles.searchResultItem}
                onMouseDown={() => {
                  setShowDropdown(false);
                  setSearchText("");
                  setSearchResults([]);
                  router.push(`/product/${item.product_id}`);
                }}
              >
                <img src={item.image_url} alt={item.product_name} className={styles.searchResultImage} />
                <span style={{ marginLeft: 8 }}>{item.product_name}</span>
                <span style={{ marginLeft: "auto" }}>
                  {Intl.NumberFormat("vi-VI", { style: "currency", currency: "VND" }).format(item.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <p className={styles.userEmail} style={{ fontSize: 20 }}>{userEmail}</p>
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
