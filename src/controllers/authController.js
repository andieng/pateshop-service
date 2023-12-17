import {
  ERROR_SOMETHING_WENT_WRONG,
  MSG_LOG_OUT_SUCCESSFULLY,
} from "../constants";

export const login = (req, res, next) => {
  if (!req.user) {
    res.status(500);
    throw new Error(ERROR_SOMETHING_WENT_WRONG);
  }
  return res.status(200).json(req.user);
};

export const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      throw err;
    }
    return;
  });
  return res.status(200).json({ message: MSG_LOG_OUT_SUCCESSFULLY });
};
