import { handleSelectCartProductsAPI } from "../../api/handlers/cart";

export const handleSelectProducts = async (
  cartProducts,
  newSelectedRowKeys,
  currentSelectedRowKeys,
  setCartProducts,
  setTotal,
) => {
  try {
    // Create arrays for selected and deselected products
    const productsToUpdate = cartProducts.map(product => {
      const isSelected = newSelectedRowKeys.includes(product.cart_product_id);
      return {
        quantity: product.quantity,
        cart_product_id: product.cart_product_id,
        selected: isSelected
      };
    });

    // Only send products whose selection state has changed
    const changedProducts = productsToUpdate.filter(product => {
      const wasSelected = currentSelectedRowKeys.includes(product.cart_product_id);
      const isSelected = newSelectedRowKeys.includes(product.cart_product_id);
      return wasSelected !== isSelected;
    });

    if (changedProducts.length > 0) {
      await handleSelectCartProductsAPI(changedProducts);
    }

    // Update local state
    const updatedCartProducts = cartProducts.map(product => ({
      ...product,
      selected: newSelectedRowKeys.includes(product.cart_product_id)
    }));

    setCartProducts(updatedCartProducts);

    // Calculate new total based on selected products
    const newTotal = updatedCartProducts
      .filter(product => newSelectedRowKeys.includes(product.cart_product_id))
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);

    setTotal(newTotal);
  } catch (error) {
    console.log("Error updating selection: ", error);
    throw error;
  }
};
