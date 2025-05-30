import Link from "next/link";
import { Table, Badge } from "antd";

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

export const handleOrderProducts = (record, orders) => {
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
        <Link href={`/product/${product.product_id}`}>
          <img
            style={{ marginRight: "10px", width: "100px" }}
            src={product.image_url}
            alt={product.product_name}
          />
        </Link>
        <Link href={`/product/${product.product_id}`}>
          <span>{product.product_name}</span>
        </Link>
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
    <Table
      showHeader={true}
      tableLayout="fixed"
      pagination={false}
      columns={orderDetailsColumns}
      dataSource={data}
    ></Table>
  );
};
