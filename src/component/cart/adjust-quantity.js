import { handleAdjustCartProductQuantityAPI } from "../../api/handlers/cart";
import { handleGetCartProducts } from "./get-products";
import cartEvents from "../../utils/events";

export function handleAdjustQuantity(
  id,
  quantity,
  cartProducts,
  setCartProducts,
  setTotal,
  setSelectedRowKeys,
  setDeletingProduct,
  setIsModalOpen
) {
  if (quantity === null) {
    return;
  } else {
    const product = cartProducts.find(
      (product) => product.cart_product_id === id
    );
    if (quantity <= 0) {
      setIsModalOpen(true);
      setDeletingProduct(product);
    } else {
      handleAdjustCartProductQuantityAPI(
        product.cart_product_id,
        quantity,
        product.selected
      )
        .then(() => {
          handleGetCartProducts(setCartProducts, setTotal, setSelectedRowKeys);
          cartEvents.emit();
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
    }
  }
}
