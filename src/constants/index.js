// Error message
export const ERROR_FAILED_CONNECTION = "Failed to create connection";
export const ERROR_NOT_CONNECTED_TO_DB = "Not connected to any database";
export const ERROR_SOMETHING_WENT_WRONG = "Something went wrong";
export const ERROR_NOT_AUTHENTICATED = "Not Authenticated";
export const ERROR_CATEGORY_NOT_FOUND = "Category does not exist";
export const ERROR_PRODUCT_NOT_FOUND = "Product does not exist";
export const ERROR_PRODUCT_SKU_NULL = "Product SKU cannot be empty";
export const ERROR_CATEGORY_NAME_NULL = "Category name cannot be empty";
export const ERROR_PRODUCT_SKU_EXISTED =
  "Product with this SKU already exists.";
export const ERROR_QUANTITY_INVALID =
  "Quantity should be a valid positive number.";
export const ERROR_PRICE_INVALID = "Price should be a valid positive number.";
export const ERROR_COST_INVALID = "Cost should be a valid positive number.";
export const ERROR_START_INVALID =
  "Starting value should be a valid positive number.";
export const ERROR_END_INVALID =
  "Ending value should be a valid positive number.";
export const ERROR_RANGE_INVALID =
  "The starting value must be less than the ending value";

export const ERROR_QUANTITY_NOT_ENOUGH = "Quantity is not enough";
export const ERROR_ORDER_NOT_FOUND = "Order not found";
export const ERROR_CUSTOMER_NOT_FOUND = "Customer not found";
export const ERROR_AT_LEAST_ONE_PRODUCT_IN_ORDER =
  "At least one product to create order";
export const ERROR_REQUIRE_MONTH_AND_YEAR =
  "Require month and year in query string";
export const ERROR_MONTH_OR_YEAR_INVALID = "Month or year is invalid";
export const ERROR_REQUIRE_YEAR = "Require year in query string";
export const ERROR_YEAR_INVALID = "Year is invalid";
export const ERROR_DATE_INVALID = "Date must be in the format of mm-dd-yyyy";
export const ERROR_MONTH_INVALID = "Month is invalid";
export const ERROR_DATE_RANGE_INVALID =
  "Start date must be smaller than End date";
export const ERROR_OPTION_INVALID = "No options found";

// Successful message
export const MSG_LOG_OUT_SUCCESSFULLY = "Log out successfully!";
export const MSG_DELETE_SUCCESSFULLY = "Deleted";
export const MSG_ADD_SUCCESSFULLY = "Added";
export const MSG_UPDATE_SUCCESSFULLY = "Updated";
export const MSG_DATABASE_CONNECTED = "Database connected";

export const ERROR_PRODUCT_ID_NOT_FOUND = (productId) => {
  return `Product [${productId}] not found`;
};
export const ERROR_NOT_ENOUGH_PRODUCT = (productId, quantity) => {
  return `Not enough product in stock: Product [${productId}] - In stock ${quantity}`;
};
