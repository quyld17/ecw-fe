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
    const product = cartProducts.find((product) => product.product_id === id);
    if (quantity <= 0) {
      setIsModalOpen(true);
      setDeletingProduct(product);
    } else {
      handleAdjustCartProductQuantityAPI(id, quantity, product.selected)
        .then(() => {
          handleGetCartProducts(
            setCartProducts,
            setTotal,
            setSelectedRowKeys
          );
          // Emit cart update event after successful quantity adjustment
          cartEvents.emit();
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
    }
  }
}
