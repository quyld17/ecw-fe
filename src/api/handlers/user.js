import getMethodAPI from "../methods/get-method-api";
import putMethodAPI from "../methods/put-method-api";
import postMethodAPI from "../methods/post-method-api";
import deleteMethodAPI from "../methods/delete-method-api";

export function handleGetUserDetailsAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/users/me";

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

export function handleChangePasswordAPI(user) {
  return new Promise((resolve, reject) => {
    const info = {
      password: user.password,
      new_password: user.new_password,
    };
    const endpoint = "/users/password";
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

export function handleUpdateUserDetailsAPI(userDetails) {
  return new Promise((resolve, reject) => {
    const endpoint = "/users/me";

    putMethodAPI(
      userDetails,
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

export function handleGetAddressesAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/addresses";

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

export function handleAddAddressAPI(addressDetails) {
  return new Promise((resolve, reject) => {
    const endpoint = "/addresses";
    postMethodAPI(
      addressDetails,
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

export function handleUpdateAddressAPI(addressID, addressDetails) {
  return new Promise((resolve, reject) => {
    const endpoint = `/addresses/${addressID}`;

    putMethodAPI(
      addressDetails,
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

export function handleSetDefaultAddressAPI(addressID) {
  return new Promise((resolve, reject) => {
    const endpoint = `/addresses/default/${addressID}`;

    putMethodAPI(
      {},
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

export function handleDeleteAddressAPI(addressID) {
  return new Promise((resolve, reject) => {
    const endpoint = `/addresses/${addressID}`;

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

export function handleGetDefaultAddressAPI() {
  return new Promise((resolve, reject) => {
    const endpoint = "/default-address";
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

export function handleGetCustomersByPageAPI(currentPage, search = "") {
  return new Promise((resolve, reject) => {
    let endpoint = `/admin/customers?page=${currentPage}`;
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

export function handleGetCustomerOrdersAPI(customerId) {
  return new Promise((resolve, reject) => {
    const endpoint = `/admin/customers/${customerId}/orders`;

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
