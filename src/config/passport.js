import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { User } from "../models";

export default passport = (passport) => {
  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  passport.deserializeUser(function (userId, done) {
    User.findByPk(userId)
      .then(function (user) {
        done(null, user);
      })
      .catch(function (err) {
        console.error(err);
      });
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      function (username, password, done) {
        User.findOne({
          where: {
            username,
          },
        })
          .then(function (user) {
            if (!user) {
              return done(null, false);
            }
            bcrypt.compare(password, user.password, function (err, result) {
              if (err) {
                return done(err);
              }
              if (!result) {
                return done(null, false);
              }
              return done(null, {
                userId: user.userId,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
              });
            });
          })
          .catch(function (err) {
            return done(err);
          });
      }
    )
  );
};
