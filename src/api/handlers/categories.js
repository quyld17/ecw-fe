import getMethodAPI from "../methods/get-method-api";

export default function handleGetAllCategoriesAPI(setCategories) {
  const endpoint = "/categories";

  getMethodAPI(
    endpoint,
    (data) => {
      setCategories(data);
    },
    (error) => {
      reject(error);
    }
  );
}
