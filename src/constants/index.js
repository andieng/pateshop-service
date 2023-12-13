// Error message
export const ERROR_WRONG_CREDENTIALS = "Wrong username or password";
export const ERROR_NOT_AUTHENTICATED = "Not Authenticated";

export const ERROR_PRODUCT_NOT_FOUND = "Product not found";
export const ERROR_QUANTITY_NOT_ENOUGH = "Quantity is not enough";
export const ERROR_ORDER_NOT_FOUND = "Order not found";
export const ERROR_CUSTOMER_NOT_FOUND = "Customer not found";
export const ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER =
  "At least one product to create order";

// Successful message
export const MSG_LOG_OUT_SUCCESSFULLY = "Log out successfully!";

export const ERROR_PRODUCT_ID_NOT_FOUND = (productId) => {
  return `Product [${productId}] not found`;
};
export const ERROR_NOT_ENOUGH_PRODUCT = (productId, quantity) => {
  return `Not enough product in stock: Product [${productId}] - In stock ${quantity}`;
};
