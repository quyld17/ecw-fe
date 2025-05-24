import { handleGetAllCartProductsAPI } from "../../api/handlers/cart";

export const handleGetCartProducts = (
  setCartProducts,
  setTotal,
  setSelectedRowKeys
) => {
  handleGetAllCartProductsAPI()
    .then((data) => {
      // First update the cart products
      setCartProducts(data.cart_products);
      
      // Set total price
      setTotal(data.total_price);
      
      // Set selected row keys for items where selected is true (1)
      const selectedKeys = data.cart_products
        .filter(product => product.selected === true || product.selected === 1)
        .map(product => product.product_id);
      setSelectedRowKeys(selectedKeys);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
};
