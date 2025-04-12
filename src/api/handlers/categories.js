import getMethodAPI from "../methods/get-method-api";
import { message } from "antd";

export default function handleGetAllCategoriesAPI(setCategories) {
  const endpoint = "/categories";

  getMethodAPI(
    endpoint,
    (data) => {
      setCategories(data);
    },
    (error) => {
      // message.error(error);
    }
  );
}
