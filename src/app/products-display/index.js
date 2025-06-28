"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  handleGetAllProductsAPI,
  handleCheckProductExistsAPI,
} from "../../api/handlers/products";

import styles from "./styles.module.css";
import { Card, Pagination, message } from "antd";
const { Meta } = Card;

export default function ProductsDisplay() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [numOfProds, setNumOfProds] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const page = searchParams.get("page") || 1;
    const sort = searchParams.get("sort") || "";
    const search = searchParams.get("search") || "";
    setCurrentPage(parseInt(page));

    handleGetAllProductsAPI(page, sort, search)
      .then((data) => {
        setProducts(data.products);
        setNumOfProds(data.num_of_prods);
      })
      .catch((error) => {
        console.log("Error getting products: ", error);
      });
  }, [searchParams]);

  const handleClick = async (id, productName) => {
    try {
      await handleCheckProductExistsAPI(id);
      router.push(`/product/${id}`);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `Product "${productName}" is no longer available`,
        duration: 3,
      });
    }
  };

  const handlePageChange = (page) => {
    const currentSort = searchParams.get("sort") || "";
    const currentSearch = searchParams.get("search") || "";
    let url = `?page=${page}`;
    if (currentSort) url += `&sort=${currentSort}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    router.push(url);
  };

  return (
    <div>
      {contextHolder}
      <div className={styles.paginationContainer}>
        <Pagination
          defaultCurrent={1}
          pageSize={10}
          total={numOfProds}
          current={currentPage}
          onChange={handlePageChange}
        />
      </div>
      <div className={styles.overall}>
        {products.map((product) => (
          <Card
            className={styles.card}
            hoverable
            cover={<img alt="Image ${index}" src={product.image_url}></img>}
            key={product.product_id}
            onClick={() =>
              handleClick(product.product_id, product.product_name)
            }
          >
            <Meta
              title={product.product_name}
              description={
                <div className={styles.price}>
                  Price:{" "}
                  {Intl.NumberFormat("vi-VI", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </div>
              }
            ></Meta>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
