import { Table, Badge, message } from "antd";
import { useRouter } from "next/navigation";
import { handleCheckProductExistsAPI } from "../../../api/handlers/products";

export const columns = [
  {
    title: <span style={{ fontSize: "20px" }}>Order ID</span>,
    dataIndex: "orderID",
    fontSize: "20px",
    align: "center",
  },
  {
    title: <span style={{ fontSize: "20px" }}>Order Date</span>,
    dataIndex: "orderDate",
    align: "center",
  },
  {
    title: <span style={{ fontSize: "20px" }}>Total Price</span>,
    dataIndex: "totalPrice",
    align: "center",
  },
  {
    title: <span style={{ fontSize: "20px" }}>Payment Method</span>,
    dataIndex: "paymentMethod",
    align: "center",
  },
  {
    title: <span style={{ fontSize: "20px" }}>Address</span>,
    dataIndex: "address",
    align: "center",
  },
  {
    title: <span style={{ fontSize: "20px" }}>Delivery Status</span>,
    dataIndex: "deliveryStatus",
    align: "center",
  },
];

export const handleOrders = (orders) => {
  let badgeStatus = "default";
  let data;
  if (!orders) {
    return data;
  }
  data = orders.map((order) => {
    switch (order.status) {
      case "Delivering":
        badgeStatus = "processing";
        break;
      case "Delivered":
        badgeStatus = "success";
        break;
      case "Canceled":
        badgeStatus = "error";
        break;
      default:
        break;
    }

    return {
      key: order.order_id,
      orderID: <p>#{order.order_id}</p>,
      orderDate: order.created_at_display,
      totalPrice: (
        <p>
          {Intl.NumberFormat("vi-VI", {
            style: "currency",
            currency: "VND",
          }).format(order.total_price)}
        </p>
      ),
      paymentMethod: order.payment_method,
      address: order.address,
      deliveryStatus: <Badge status={badgeStatus} text={order.status} />,
    };
  });

  return data;
};

const OrderProductsTable = ({ record, orders }) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleProductClick = async (productId, productName) => {
    try {
      await handleCheckProductExistsAPI(productId);
      router.push(`/product/${productId}`);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `Product "${productName}" is no longer available`,
        duration: 3,
      });
    }
  };

  const orderDetailsColumns = [
    {
      title: <span style={{ fontSize: "20px" }}>Products</span>,
      dataIndex: "product",
      fontSize: "20px",
      width: "300px",
    },
    {
      title: <span style={{ fontSize: "20px" }}>Size</span>,
      dataIndex: "size",
      align: "center",
    },
    {
      title: <span style={{ fontSize: "20px" }}>Quantity</span>,
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: <span style={{ fontSize: "20px" }}>Price</span>,
      dataIndex: "price",
      align: "center",
    },
    {
      title: <span style={{ fontSize: "20px" }}>Subtotal</span>,
      dataIndex: "subtotal",
      align: "center",
    },
  ];

  const matchedOrder = orders.find((order) => order.order_id === record.key);

  const data = matchedOrder.products.map((product) => ({
    key: product.id,
    product: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{ marginRight: "10px", width: "100px", cursor: "pointer" }}
          onClick={() =>
            handleProductClick(product.product_id, product.product_name)
          }
        >
          <img
            style={{ width: "100%" }}
            src={product.image_url}
            alt={product.product_name}
          />
        </div>
        <span
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() =>
            handleProductClick(product.product_id, product.product_name)
          }
        >
          {product.product_name}
        </span>
      </div>
    ),
    size: product.size_name,
    quantity: product.quantity,
    price: Intl.NumberFormat("vi-VI", {
      style: "currency",
      currency: "VND",
    }).format(product.price),
    subtotal: Intl.NumberFormat("vi-VI", {
      style: "currency",
      currency: "VND",
    }).format(product.price * product.quantity),
  }));

  return (
    <>
      {contextHolder}
      <Table
        showHeader={true}
        tableLayout="fixed"
        pagination={false}
        columns={orderDetailsColumns}
        dataSource={data}
      ></Table>
    </>
  );
};

export const handleOrderProducts = (record, orders) => {
  return <OrderProductsTable record={record} orders={orders} />;
};
