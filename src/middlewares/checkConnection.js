import { ERROR_NOT_CONNECTED_TO_DB } from "../constants";
import { isConnected } from "../models";

const checkConnection = async (req, res, next) => {
  if (!isConnected) {
    res.status(400);
    throw new Error(ERROR_NOT_CONNECTED_TO_DB);
  }
  next();
};

export default checkConnection;
