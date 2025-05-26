"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleGetAllProductsAPI } from "../../api/handlers/products";

import styles from "./styles.module.css";
import { Card, message, Pagination } from "antd";
const { Meta } = Card;

export default function ProductsDisplay() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [numOfProds, setNumOfProds] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const page = searchParams.get('page') || 1;
    const sort = searchParams.get('sort') || '';
    const category = searchParams.get('category') || '';
    setCurrentPage(parseInt(page));

    handleGetAllProductsAPI(page, sort, category)
      .then((data) => {
        setProducts(data.products);
        setNumOfProds(data.num_of_prods);
      })
      .catch((error) => {
        console.log("Error getting products: ", error);
      });
  }, [searchParams]);

  const handleClick = (id) => {
    router.push(`/product/${id}`);
  };

  const handlePageChange = (page) => {
    const currentSort = searchParams.get('sort') || '';
    const currentCategory = searchParams.get('category') || '';
    let url = `?page=${page}`;
    if (currentSort) url += `&sort=${currentSort}`;
    if (currentCategory) url += `&category=${currentCategory}`;
    router.push(url);
  };

  return (
    <div>
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
      <div className={styles.paginationContainer}>
        <Pagination
          defaultCurrent={1}
          pageSize={5}
          total={numOfProds}
          current={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
