import postMethodAPI from "../methods/post-method-api";

export function handleSignUpAPI(email, password) {
  return new Promise((resolve, reject) => {
    const credentials = {
      email,
      password,
    };

    const endpoint = "/sign-up";

    postMethodAPI(
      credentials,
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
