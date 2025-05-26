import postMethodAPI from "../methods/post-method-api";
import getMethodAPI from "../methods/get-method-api";

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
