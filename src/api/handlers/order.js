import postMethodAPI from "../methods/post-method-api";
import getMethodAPI from "../methods/get-method-api";
import putMethodAPI from "../methods/put-method-api";

export function handleCreateOrderAPI(paymentMethod, address) {
  return new Promise((resolve, reject) => {
    const info = {
      payment_method: paymentMethod,
      address: address,
    };
    const endpoint = "/orders";

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

export function handleGetOrdersAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/orders/me?page=1";

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

export function handleGetOrdersByPageAPI(currentPage, sort = "", search = "") {
  return new Promise((resolve, reject) => {
    let endpoint = `/admin/orders?page=${currentPage}`;
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

export function handleUpdateOrderStatusAPI(data) {
  return new Promise((resolve, reject) => {
    const endpoint = `/admin/orders`;

    putMethodAPI(
      data,
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
