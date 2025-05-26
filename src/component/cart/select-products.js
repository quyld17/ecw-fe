import { handleSelectCartProductsAPI } from "../../api/handlers/cart";

export const handleSelectProducts = async (
  cartProducts,
  newSelectedRowKeys,
  currentSelectedRowKeys,
  setCartProducts,
  setTotal
) => {
  try {
    const productsToUpdate = cartProducts.map((product) => {
      const isSelected = newSelectedRowKeys.includes(product.cart_product_id);
      return {
        quantity: product.quantity,
        cart_product_id: product.cart_product_id,
        selected: isSelected,
      };
    });

    const changedProducts = productsToUpdate.filter((product) => {
      const wasSelected = currentSelectedRowKeys.includes(
        product.cart_product_id
      );
      const isSelected = newSelectedRowKeys.includes(product.cart_product_id);
      return wasSelected !== isSelected;
    });

    if (changedProducts.length > 0) {
      await handleSelectCartProductsAPI(changedProducts);
    }

    const updatedCartProducts = cartProducts.map((product) => ({
      ...product,
      selected: newSelectedRowKeys.includes(product.cart_product_id),
    }));

    setCartProducts(updatedCartProducts);

    const newTotal = updatedCartProducts
      .filter((product) => newSelectedRowKeys.includes(product.cart_product_id))
      .reduce((sum, product) => sum + product.price * product.quantity, 0);

    setTotal(newTotal);
  } catch (error) {
    console.log("Error updating selection: ", error);
    throw error;
  }
};
