import styles from "./styles.module.css";
import { InputNumber, Space } from "antd";

export const cartColumns = [
  {
    title: <span style={{ fontSize: "25px" }}>Products</span>,
    dataIndex: "product",
    width: "400px",
  },
  {
    title: "Size",
    dataIndex: "size",
    align: "center",
  },
  {
    title: "Unit Price",
    dataIndex: "unitPrice",
    align: "center",
  },
  {
    title: "Quantity",
    dataIndex: "quantityDisplay",
    align: "center",
  },
  {
    title: "Action",
    dataIndex: "action",
    align: "center",
  },
];

export const cartData = (
  cartProducts,
  handleProductRedirect,
  adjustedQuantityHandler,
  router
) => {
  let data;
  if (!cartProducts) {
    return data;
  }
  data = cartProducts.map((product) => ({
    key: product.cart_product_id,
    product: (
      <div className={styles.productThumbnailAndName}>
        <img
          className={styles.productThumbnail}
          src={product.image_url}
          alt={product.product_name}
          onClick={() => handleProductRedirect(product.product_id, router)}
        />
        <span
          className={styles.productName}
          onClick={() => handleProductRedirect(product.product_id, router)}
        >
          {product.product_name}
        </span>
      </div>
    ),
    size: product.size_name,
    price: product.price,
    unitPrice: Intl.NumberFormat("vi-VI", {
      style: "currency",
      currency: "VND",
    }).format(product.price),
    quantity: product.quantity,
    quantityDisplay: (
      <InputNumber
        min={0}
        max={product.size_quantity}
        defaultValue={product.quantity}
        value={product.quantity}
        onChange={(quantity) =>
          adjustedQuantityHandler(product.cart_product_id, quantity)
        }
      />
    ),
    totalPrice: Intl.NumberFormat("vi-VI", {
      style: "currency",
      currency: "VND",
    }).format(product.price * product.quantity),
    action: (
      <Space size="middle">
        <a
          className={styles.deleteButton}
          onClick={() => adjustedQuantityHandler(product.cart_product_id, 0)}
        >
          Delete
        </a>
      </Space>
    ),
  }));

  return data;
};
