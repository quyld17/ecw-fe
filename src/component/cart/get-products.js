import { handleGetAllCartProductsAPI } from "../../api/handlers/cart";

export const handleGetCartProducts = (
  setCartProducts,
  setTotal,
  setSelectedRowKeys
) => {
  handleGetAllCartProductsAPI()
    .then((data) => {
      setCartProducts(data.cart_products);
      setTotal(data.total_price);
      
      const selectedKeys = data.cart_products
        .filter(product => product.selected === true || product.selected === 1)
        .map(product => product.cart_product_id);
      setSelectedRowKeys(selectedKeys);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
};
