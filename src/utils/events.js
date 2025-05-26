const cartEvents = {
  subscribe: (callback) => {
    if (typeof window !== "undefined") {
      window.addEventListener("cart-updated", callback);
    }
  },
  unsubscribe: (callback) => {
    if (typeof window !== "undefined") {
      window.removeEventListener("cart-updated", callback);
    }
  },
  emit: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }
  },
};

export default cartEvents;
