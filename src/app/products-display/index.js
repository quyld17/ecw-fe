"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleGetAllProductsAPI } from "../../api/handlers/products";
import { handleAddToCartAPI } from "../../api/handlers/cart";
import cartEvents from "../../utils/events";

import styles from "./styles.module.css";
import { Card, Button, message, Pagination } from "antd";
const { Meta } = Card;

export default function ProductsDisplay() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [numOfProds, setNumOfProds] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // useEffect(() => {
  // Ensure that the router query is available on the client side
  if (router.query && router.query.page) {
    setCurrentPage(parseInt(router.query.page) || 1);
  }
  // }, [router.query]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    handleGetAllProductsAPI(currentPage)
      .then((data) => {
        setProducts(data.products);
        setNumOfProds(data.num_of_prods);
      })
      .catch((error) => {
        console.log("Error getting delivery address: ", error);
      });
  }, [currentPage]);

  const handleClick = (id) => {
    router.push(`/product/${id}`);
  };

  const handleAddToCartClick = (event, id) => {
    event.stopPropagation();

    if (token === null) {
      messageApi.info("Please sign in to continue");
      return;
    }

    handleAddToCartAPI(id, 1)
      .then(() => {
        messageApi.open({
          type: "success",
          content: "Add product to cart successfully!",
        });
        // Emit cart update event
        cartEvents.emit();
      })
      .catch((error) => {
        messageApi.info(error);
      });
  };

  const handlePageChange = (page) => {
    router.push(`?page=${page}`);
  };

  return (
    <div>
      {contextHolder}
      <div className={styles.overall}>
        {products.map((product) => (
          <Card
            className={styles.card}
            hoverable
            cover={<img alt="Image ${index}" src={product.image_url}></img>}
            key={product.product_id}
            onClick={() => handleClick(product.product_id)}
          >
            <Meta
              title={product.product_name}
              description={
                <div>
                  Price:{" "}
                  {Intl.NumberFormat("vi-VI", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                  <Button
                    type="primary"
                    className={styles.addToCartButton}
                    onClick={(event) =>
                      handleAddToCartClick(event, product.product_id)
                    }
                  >
                    Add to cart
                  </Button>
                </div>
              }
            ></Meta>
          </Card>
        ))}
      </div>
      <Pagination
        defaultCurrent={1}
        pageSize={5}
        total={numOfProds}
        current={currentPage}
        onChange={handlePageChange}
      />
    </div>
  );
}
