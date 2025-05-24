import { handleSelectCartProductsAPI } from "../../api/handlers/cart";

export const handleSelectProducts = async (
  cartProducts,
  newSelectedRowKeys,
  currentSelectedRowKeys,
  setCartProducts,
  setTotal,
  setSelectedRowKeys
) => {
  const newlySelectedProducts = newSelectedRowKeys.filter(
    (key) => !currentSelectedRowKeys.includes(key)
  );
  const newlyDeselectedProducts = currentSelectedRowKeys.filter(
    (key) => !newSelectedRowKeys.includes(key)
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

  try {
    if (selectedProducts.length !== 0) {
      await handleSelectCartProductsAPI(selectedProducts);
    } else if (deselectedProducts.length !== 0) {
      await handleSelectCartProductsAPI(deselectedProducts);
    }

    // Update cart products to reflect new selection state
    const updatedCartProducts = cartProducts.map(product => {
      if (newSelectedRowKeys.includes(product.product_id)) {
        return { ...product, selected: true };
      }
      return { ...product, selected: false };
    });

    setCartProducts(updatedCartProducts);

    // Calculate new total based on selected products
    const newTotal = updatedCartProducts
      .filter(product => newSelectedRowKeys.includes(product.product_id))
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);

    setTotal(newTotal);
  } catch (error) {
    console.log("Error updating selection: ", error);
    throw error; // Propagate error to parent component
  }
};
