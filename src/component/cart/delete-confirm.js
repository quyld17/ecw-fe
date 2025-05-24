import { handleDeleteCartProductAPI } from "../../api/handlers/cart";
import { handleGetCartProducts } from "./get-products";
import cartEvents from "../../utils/events";

export const handleOk = (
  deletingProduct,
  setIsModalOpen,
  setCartProducts,
  setTotal,
  setSelectedRowKeys,
  setSelectedRowKeysPrev
) => {
  if (deletingProduct) {
    handleDeleteCartProductAPI(deletingProduct.product_id)
      .then(() => {
        handleGetCartProducts(
          setCartProducts,
          setTotal,
          setSelectedRowKeys,
          setSelectedRowKeysPrev
        );
        // Emit cart update event after successful deletion
        cartEvents.emit();
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }
  setIsModalOpen(false);
};

export const handleCancel = (setIsModalOpen) => {
  setIsModalOpen(false);
};
