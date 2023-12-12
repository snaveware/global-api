const Login = require("../utils/Login");
const RequestHandler = require("../utils/RequestHandler");
const Joi = require("joi");
const User = require("../models/user.model");
const { sign, verify } = require("jsonwebtoken");
const { hash } = require("bcryptjs");
const Email = require("../utils/Email");
const sgMail = require("@sendgrid/mail");
const { sendRecoveryEmail } = require("../utils/NodemailerMail");

const emailSender = new Email();

module.exports = class Auth {
  static async login(req, res) {
    try {
      //make sure email and password are passed
      if (!req.body || !req.body.email || !req.body.password) {
        RequestHandler.throwError(400, "Email and password are required")();
      }
      const email = req.body.email;
      const password = req.body.password;

      //validate email and password
      const { validationError, value } = Login.validate(email, password);
      if (validationError) {
        RequestHandler.throwError(400, validationError)();
      }

      //find user
      const { userError, user } = await Login.findUser(email);
      if (userError) {
        RequestHandler.throwError(400, userError)();
      } else if (user.details.status != "active") {
        RequestHandler.throwError(
          400,
          "Your account is currently deactivated"
        )();
      }

      if (!user) {
        RequestHandler.throwError(400, "could not find your account")();
      }

      //compare passwords
      const { passwordError, isValid } = await Login.comparePasswords(
        password,
        user.details.password
      );
      if (passwordError) {
        RequestHandler.throwError(400, passwordError)();
      }
      //generate token
      const { tokenError, token } = await Login.genToken(
        user.details._id,
        user.group.level,
        user.group.permissions,
        user.details.branch,
        user.details.firstName,
        user.details.lastName,
        user.details.telephone
      );
      if (tokenError) {
        RequestHandler.throwError(400, tokenError)();
      }

      //prepare response
      const response = {
        id: user.details._id,
        firstName: user.details.firstName,
        lastName: user.details.lastName,
        level: user.group.level,
        permissions: user.group.permissions,
        token: token,
      };
      RequestHandler.sendSuccess(res, response);
    } catch (error) {
      RequestHandler.sendError(res, error);
    }
  }

  static async sendRecoveryEmail(req, res) {
    try {
      //make sure email is passed
      const validationSchema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        setNewPasswordUrl: Joi.string().uri().required(),
      });

      const { value: validated, error } = await validationSchema.validate(
        req.body
      );
      if (error) {
        RequestHandler.throwError(400, error)();
      }

      const { user } = await User.findByEmail(validated.email);
      if (!user) {
        return RequestHandler.sendSuccess(
          res,
          "Sent a recovery url to the email if it is registered to a user"
        );
      }
      const token = sign(
        {
          _id: user._id,
        },
        process.env.PASSWORDSECRET,
        { expiresIn: 600 }
      );

      const url = `${validated.setNewPasswordUrl}?t=${token}`;

      //sendEmail
      // const email = emailSender.preparePasswordRecoveryEmail(user.email,'Password Recovery',url)

      // await sgMail.send(email)
      sendRecoveryEmail(user.email, "Password Recovery", url)
        .then((success) => {
          return RequestHandler.sendSuccess(
            res,
            "Recovery Email sent successfully"
          );
        })
        .catch((error) => {
          return RequestHandler.sendError(
            res,
            new Error("Failed to send Recovery Email")
          );
        });

      RequestHandler.sendSuccess(
        res,
        "Sent a recovery url to the email if it is registered to a user"
      );
    } catch (error) {
      RequestHandler.sendError(res, error);
    }
  }

  static async recoverPassword(req, res) {
    try {
      //make sure passwords are passed
      const validationSchema = Joi.object({
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.ref("password"),
        token: Joi.string().required(),
      });

      const { value: validated, error } = await validationSchema.validate(
        req.body
      );

      if (error) {
        RequestHandler.throwError(400, error)();
      }

      //verifytoken
      let extracted;
      try {
        extracted = await verify(validated.token, process.env.PASSWORDSECRET);
      } catch (error) {
        RequestHandler.throwError(400, "Link expired")();
      }

      const hashedPassword = await hash(validated.password, 10);

      const { updation, error: updationError } = User.updateOne(extracted._id, {
        password: hashedPassword,
      });

      if (updationError) {
        RequestHandler.throwError(500, "Error changing your password")();
      }

      RequestHandler.sendSuccess(res, "Password changed successfully");
    } catch (error) {
      RequestHandler.sendError(res, error);
    }
  }
};
