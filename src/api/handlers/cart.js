import getMethodAPI from "../methods/get-method-api";
import postMethodAPI from "../methods/post-method-api";
import putMethodAPI from "../methods/put-method-api";
import deleteMethodAPI from "../methods/delete-method-api";

export function handleGetAllCartProductsAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/cart-products";

    getMethodAPI(
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleGetCartSelectedProductsAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/cart-products?selected=true";

    getMethodAPI(
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleAddToCartAPI(product_id, quantity, size_id) {
  return new Promise((resolve, reject) => {
    const info = {
      product_id,
      quantity,
      size_id,
    };
    const endpoint = "/cart-products";

    postMethodAPI(
      info,
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleAdjustCartProductQuantityAPI(
  cart_product_id,
  quantity,
  selected
) {
  return new Promise((resolve, reject) => {
    const info = [
      {
        cart_product_id,
        quantity,
        selected,
      },
    ];
    const endpoint = "/cart-products";

    putMethodAPI(
      info,
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleSelectCartProductsAPI(selectedProduct) {
  return new Promise((resolve, reject) => {
    const endpoint = "/cart-products";

    putMethodAPI(
      selectedProduct,
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleDeleteCartProductAPI(cart_product_id) {
  return new Promise((resolve, reject) => {
    const endpoint = `/cart-products/${cart_product_id}`;

    deleteMethodAPI(
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function handleCheckCartQuantitiesAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/products/quantity";

    getMethodAPI(
      endpoint,
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
