import { handleSelectCartProductsAPI } from "../../api/handlers/cart";
import { handleGetCartProducts } from "./get-products";

export const handleSelectProducts = (
  cartProducts,
  selectedRowKeys,
  selectedRowKeysPrev,
  setCartProducts,
  setTotal,
  setSelectedRowKeys,
  setSelectedRowKeysPrev
) => {
  const newlySelectedProducts = selectedRowKeys.filter(
    (key) => !selectedRowKeysPrev.includes(key)
  );
  const newlyDeselectedProducts = selectedRowKeysPrev.filter(
    (key) => !selectedRowKeys.includes(key)
  );

  const selectedProducts = newlySelectedProducts.map((key) => {
    const product = cartProducts.find((p) => p.product_id === key);
    return {
      quantity: product.quantity,
      product_id: key,
      selected: true,
    };
  });

  const deselectedProducts = newlyDeselectedProducts.map((key) => {
    const product = cartProducts.find((p) => p.product_id === key);
    return {
      quantity: product.quantity,
      product_id: key,
      selected: false,
    };
  });

  const updateSelection = async () => {
    try {
      if (selectedProducts.length !== 0) {
        await handleSelectCartProductsAPI(selectedProducts);
      } else if (deselectedProducts.length !== 0) {
        await handleSelectCartProductsAPI(deselectedProducts);
      }

      // Only update selected states after successful update
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRowKeysPrev(selectedRowKeys);

      // Now fetch updated cart to sync with server
      handleGetCartProducts(
        setCartProducts,
        setTotal,
        setSelectedRowKeys,
        setSelectedRowKeysPrev
      );
    } catch (error) {
      console.log("Error updating selection: ", error);
    }
  };

  updateSelection();
};
