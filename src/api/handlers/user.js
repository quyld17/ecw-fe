import getMethodAPI from "../methods/get-method-api";
import putMethodAPI from "../methods/put-method-api";

import { message } from "antd";

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
