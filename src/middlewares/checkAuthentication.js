import { ERROR_NOT_AUTHENTICATED } from "../constants";

const checkAuthentication = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401);
    throw new Error(ERROR_NOT_AUTHENTICATED);
  }
  next();
};

export default checkAuthentication;
