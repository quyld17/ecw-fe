"use client";

import { useState, useEffect, use } from "react";
import Head from "next/head";

import NavigationBar from "../../../component/navigation-bar/index";
import styles from "./styles.module.css";
import { handleGetProductDetailsAPI } from "../../../api/handlers/products";
import { handleAddToCartAPI } from "../../../api/handlers/cart";
import cartEvents from "../../../utils/events";

import { Layout, Image, InputNumber, Button, message } from "antd";
const { Content } = Layout;

export default function ProductPage({ params }) {
  const [productDetail, setProductDetail] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const { id: productID } = use(params);

  useEffect(() => {
    if (productID) {
      handleGetProductDetailsAPI(productID)
        .then((data) => {
          setProductDetail(data);
        })
        .catch((error) => {
          messageApi.open({
            type: "error",
            content: error.message == null ? error : error.message,
          });
        });
    }
  }, [productID]);

  useEffect(() => {
    if (
      productDetail &&
      productDetail.product_images &&
      productDetail.product_images.length > 0
    ) {
      const thumbnail = productDetail.product_images.find(
        (image) => image.is_thumbnail === 1
      );
      const otherImages = productDetail.product_images
        .filter((image) => image.is_thumbnail === 0)
        .map((image) => image.image_url);

      if (thumbnail) {
        setImageURLs([thumbnail.image_url, ...otherImages]);
      } else {
        setImageURLs(otherImages);
      }
    }
  }, [productDetail]);

  useEffect(() => {
    setSelectedSizeIndex(0);
  }, [productDetail]);

  const selectedSize = productDetail?.product_sizes?.[selectedSizeIndex];

  const handleQuantitySelection = (value) => {
    setQuantity(value);
  };

  const handleAddToCartClick = () => {
    if (!selectedSize) return;
    handleAddToCartAPI(productDetail.product_detail.product_id, quantity, selectedSize.size_id)
      .then((data) => {
        if (data.error) {
          messageApi.open({
            type: "error",
            content: "Add product to cart unsuccessfully! Please try again",
          });
        } else {
          messageApi.open({
            type: "success",
            content: "Add product to cart successfully!",
          });
          cartEvents.emit();
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  return (
    <Layout className={styles.layout}>
      {contextHolder}
      <Head>
        {productDetail && (
          <title>{productDetail.product_detail.product_name}</title>
        )}
      </Head>
      <NavigationBar />
      <Content className={styles.mainPage}>
        <div className={styles.productField}>
          <div className={styles.productImages}>
            <div className={styles.thumbnail}>
              {imageURLs.length > 0 && (
                <Image width={400} alt="Thumbnail" src={imageURLs[0]} />
              )}
            </div>

            <div className={styles.imageList}>
              <Image.PreviewGroup
                preview={{
                  onChange: (current, prev) =>
                    console.log(
                      `current index: ${current}, prev index: ${prev}`
                    ),
                }}
              >
                {imageURLs.map((item, index) => (
                  <Image
                    key={index}
                    width={100}
                    alt={`Image ${index}`}
                    src={item}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          </div>
          <div className={styles.productInfos}>
            {productDetail && (
              <>
                <p className={styles.productName}>
                  {productDetail.product_detail.product_name}
                </p>

                <div className={styles.productPrice}>
                  <p className={styles.priceTitle}>Price:</p>

                  <p className={styles.priceNumber}>
                    {" "}
                    {Intl.NumberFormat("vi-VI", {
                      style: "currency",
                      currency: "VND",
                    }).format(productDetail.product_detail.price)}
                  </p>
                </div>

                <div className={styles.sizeSelection}>
                  <p className={styles.sizeTitle}>Size:</p>
                  <div className={styles.sizeList}>
                    {productDetail.product_sizes?.map((size, idx) => (
                      <Button
                        key={size.size_id}
                        type={selectedSizeIndex === idx ? "primary" : "default"}
                        onClick={() => setSelectedSizeIndex(idx)}
                      >
                        {size.size_name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={styles.quantitySelection}>
                  <p className={styles.quantityTitle}>Quantity: </p>
                  <div className={styles.quantityInput}>
                    <InputNumber
                      min={1}
                      max={selectedSize?.quantity || 1}
                      defaultValue={quantity}
                      value={quantity}
                      onChange={handleQuantitySelection}
                    />
                  </div>
                  <span className={styles.quantityAvailable}>
                    {" "}
                    {selectedSize?.quantity || 0} pieces available
                  </span>
                </div>

                <Button
                  type="primary"
                  size={"large"}
                  onClick={handleAddToCartClick}
                >
                  Add to cart
                </Button>
              </>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
