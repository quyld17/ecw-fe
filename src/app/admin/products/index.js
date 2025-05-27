"use client";

import { useState, useEffect } from "react";
import {
  handleGetAllProductsAPI,
  handleDeleteProductAPI,
  handleGetProductDetailsAPI,
  handleUpdateProductAPI,
  handleAddProductAPI,
} from "../../../api/handlers/products";
import {
  Table,
  Input,
  Space,
  Select,
  Typography,
  Button,
  Modal,
  Form,
  message,
  Image,
  InputNumber,
  List,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("price_desc");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await handleGetAllProductsAPI(
        currentPage,
        sort,
        searchQuery
      );

      if (response && response.products) {
        const formattedProducts = response.products.map((product) => ({
          key: product.product_id,
          ...product,
          total_quantity: product.total_quantity,
        }));
        setProducts(formattedProducts);
        setTotalProducts(response.num_of_prods);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product) => {
    try {
      setSelectedProduct(product);
      const details = await handleGetProductDetailsAPI(product.product_id);
      setProductDetails(details);
      form.setFieldsValue({
        product_name: details.product_detail.product_name,
        price: details.product_detail.price,
        total_quantity: product.total_quantity,
      });
      setIsModalVisible(true);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to fetch product details",
      });
    }
  };

  const handleAdd = () => {
    setSelectedProduct({ product_id: 0 });
    setProductDetails({
      product_detail: {
        product_name: "",
        price: 0,
      },
      product_images: [],
      product_sizes: [],
    });
    form.resetFields();
    setIsAddingProduct(true);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsAddingProduct(false);
    setSelectedProduct(null);
    setProductDetails(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const totalQuantity = productDetails.product_sizes.reduce(
        (total, size) =>
          total + (form.getFieldValue(`size_${size.size_name}`) || 0),
        0
      );

      // Validate required fields for new product
      if (isAddingProduct) {
        if (
          !values.product_name ||
          !values.price ||
          productDetails.product_images.length === 0 ||
          productDetails.product_sizes.length === 0
        ) {
          messageApi.open({
            type: "error",
            content:
              "Please fill all required fields (name, price, at least 1 image and 1 size)",
          });
          return;
        }
      }

      const productData = {
        product: {
          product_id: selectedProduct.product_id,
          name: values.product_name,
          price: values.price,
          total_quantity: totalQuantity,
        },
        sizes: productDetails.product_sizes.map((size) => ({
          size_name: size.size_name,
          quantity: form.getFieldValue(`size_${size.size_name}`) || 0,
        })),
        image_urls: productDetails.product_images.map((img) => img.image_url),
      };

      try {
        if (isAddingProduct) {
          await handleAddProductAPI(productData);
          messageApi.open({
            type: "success",
            content: "Product added successfully",
          });
        } else {
          await handleUpdateProductAPI(productData);
          messageApi.open({
            type: "success",
            content: "Product updated successfully",
          });
        }
        setIsModalVisible(false);
        setIsAddingProduct(false);
        fetchProducts();
      } catch (apiError) {
        messageApi.open({
          type: "error",
          content:
            apiError.message ||
            (isAddingProduct
              ? "Failed to add product"
              : "Failed to update product"),
        });
      }
    } catch (formError) {
      messageApi.open({
        type: "error",
        content: "Please check all required fields",
      });
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      handleDeleteProductAPI(selectedProduct.product_id)
        .then((data) => {
          console.log(data);
          messageApi.open({
            type: "success",
            content: data,
          });
          setIsModalVisible(false);
          fetchProducts();
        })
        .catch((error) => {
          console.log(error);
          messageApi.open({
            type: "error",
            content: error,
          });
        });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "product_id",
      key: "id",
      width: 80,
    },
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      render: (image_url) => (
        <img
          src={image_url}
          alt="Product"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "product_name",
      key: "name",
      sorter: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) =>
        Intl.NumberFormat("vi-VI", {
          style: "currency",
          currency: "VND",
        }).format(price),
      sorter: true,
    },
    {
      title: "Quantity",
      dataIndex: "total_quantity",
      key: "quantity",
      sorter: true,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);

    if (sorter.field && sorter.order) {
      const sortOrder = sorter.order === "descend" ? "desc" : "asc";
      setSort(`${sorter.field}_${sortOrder}`);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Product
          </Button>
          <Space>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              defaultValue={sort}
              onChange={setSort}
              style={{ width: 200 }}
              options={[
                { label: "Price: High to Low", value: "price_desc" },
                { label: "Price: Low to High", value: "price_asc" },
                { label: "Name A-Z", value: "name_asc" },
                { label: "Name Z-A", value: "name_desc" },
              ]}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalProducts,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />

        <Modal
          title={isAddingProduct ? "Add New Product" : "Edit Product"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleCloseModal}
          width={800}
          footer={[
            <Button key="cancel" onClick={handleCloseModal}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleModalOk}>
              {isAddingProduct ? "Add" : "Save Changes"}
            </Button>,
            !isAddingProduct && (
              <Button
                key="delete"
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                style={{ position: "absolute", left: 24 }}
              >
                Delete
              </Button>
            ),
          ]}
        >
          {productDetails && (
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                product_name: productDetails.product_detail.product_name,
                price: productDetails.product_detail.price,
                ...productDetails.product_sizes.reduce(
                  (acc, size) => ({
                    ...acc,
                    [`size_${size.size_name}`]: size.quantity,
                  }),
                  {}
                ),
              }}
            >
              <Form.Item
                name="product_name"
                label="Product Name"
                rules={[
                  { required: true, message: "Please input the product name!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="price"
                label="Price (VND)"
                rules={[{ required: true, message: "Please input the price!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                />
              </Form.Item>

              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Product Images
                  </Typography.Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddingImage(true)}
                  >
                    Add Image
                  </Button>
                </div>
                {isAddingImage && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <Input
                      placeholder="Enter image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <Button
                      type="primary"
                      onClick={() => {
                        if (newImageUrl) {
                          setProductDetails({
                            ...productDetails,
                            product_images: [
                              ...productDetails.product_images,
                              { image_url: newImageUrl },
                            ],
                          });
                          setNewImageUrl("");
                          setIsAddingImage(false);
                        }
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setNewImageUrl("");
                        setIsAddingImage(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <List
                  grid={{ gutter: 16, column: 4 }}
                  dataSource={productDetails.product_images}
                  renderItem={(image, index) => (
                    <List.Item>
                      <div style={{ position: "relative" }}>
                        <Image
                          src={image.image_url}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            background: "rgba(255, 255, 255, 0.8)",
                          }}
                          onClick={() => {
                            const newImages =
                              productDetails.product_images.filter(
                                (_, i) => i !== index
                              );
                            setProductDetails({
                              ...productDetails,
                              product_images: newImages,
                            });
                          }}
                        />
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Sizes and Quantities
                  </Typography.Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddingSize(true)}
                  >
                    Add Size
                  </Button>
                </div>
                {isAddingSize && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <Input
                      placeholder="Enter size"
                      value={newSizeName}
                      onChange={(e) =>
                        setNewSizeName(e.target.value.toUpperCase())
                      }
                      style={{ width: "70%" }}
                    />
                    <InputNumber
                      placeholder="Quantity"
                      min={0}
                      value={0}
                      style={{ width: "30%" }}
                      onChange={(value) =>
                        form.setFieldsValue({ [`size_${newSizeName}`]: value })
                      }
                    />
                    <Button
                      type="primary"
                      onClick={() => {
                        if (newSizeName) {
                          setProductDetails({
                            ...productDetails,
                            product_sizes: [
                              ...productDetails.product_sizes,
                              {
                                size_name: newSizeName,
                                quantity:
                                  form.getFieldValue(`size_${newSizeName}`) ||
                                  0,
                              },
                            ],
                          });
                          setNewSizeName("");
                          setIsAddingSize(false);
                        }
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setNewSizeName("");
                        setIsAddingSize(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <List
                  dataSource={productDetails.product_sizes}
                  renderItem={(size) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          title="Are you sure you want to delete this size?"
                          onConfirm={() => {
                            const newSizes =
                              productDetails.product_sizes.filter(
                                (s) => s.size_name !== size.size_name
                              );
                            setProductDetails({
                              ...productDetails,
                              product_sizes: newSizes,
                            });
                          }}
                        >
                          <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flex: 1,
                        }}
                      >
                        <Typography.Text strong style={{ width: 100 }}>
                          Size {size.size_name}
                        </Typography.Text>
                        <Form.Item
                          name={`size_${size.size_name}`}
                          style={{ margin: 0, flex: 1 }}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            onChange={(value) => {
                              const newSizes = productDetails.product_sizes.map(
                                (s) =>
                                  s.size_name === size.size_name
                                    ? { ...s, quantity: value }
                                    : s
                              );
                              setProductDetails({
                                ...productDetails,
                                product_sizes: newSizes,
                              });
                            }}
                          />
                        </Form.Item>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Form>
          )}
        </Modal>
      </Space>
    </div>
  );
}
