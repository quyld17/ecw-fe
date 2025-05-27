import getMethodAPI from "../methods/get-method-api";
import deleteMethodAPI from "../methods/delete-method-api";
import putMethodAPI from "../methods/put-method-api";
import postMethodAPI from "../methods/post-method-api";

export function handleGetAllProductsAPI(currentPage, sort = "", search = "") {
  return new Promise((resolve, reject) => {
    let endpoint = `/products?page=${currentPage}`;
    if (sort) endpoint += `&sort=${sort}`;
    if (search) endpoint += `&search=${search}`;

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

export function handleGetProductDetailsAPI(product_id) {
  return new Promise((resolve, reject) => {
    const endpoint = `/products/${product_id}`;

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

export function handleSearchProductsAPI(query) {
  return new Promise((resolve, reject) => {
    const endpoint = `/products/search?q=${encodeURIComponent(query)}`;
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

export function handleDeleteProductAPI(product_id) {
  return new Promise((resolve, reject) => {
    const endpoint = `/admin/products/${product_id}`;

    deleteMethodAPI(
      endpoint,
      (data) => {
        console.log(data);
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export const handleUpdateProductAPI = async (updateData) => {
  return new Promise((resolve, reject) => {
    const endpoint = `/admin/products`;

    putMethodAPI(
      updateData,
      endpoint,
      (response) => {
        resolve(response);
      },
      (error) => {
        reject(new Error(error.message || "Failed to update product"));
      }
    );
  });
};

export const handleAddProductAPI = async (productData) => {
  return new Promise((resolve, reject) => {
    const endpoint = `/admin/products`;

    postMethodAPI(
      productData,
      endpoint,
      (response) => {
        resolve(response);
      },
      (error) => {
        reject(new Error(error.message || "Failed to add product"));
      }
    );
  });
};
