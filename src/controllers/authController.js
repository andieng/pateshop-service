import { MSG_LOG_OUT_SUCCESSFULLY } from "../constants";

export const login = (req, res) => {
  return res.json(req.user);
};

export const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      throw err;
    }
    return;
  });
  return res.status(200).json({ msg: MSG_LOG_OUT_SUCCESSFULLY });
};
