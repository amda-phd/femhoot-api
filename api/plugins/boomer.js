"use strict";

const register = (server) => {
  const Boom = require("@hapi/boom");

  server.method("translateError", require("Utils/translateError"));
  server.app.ERR_MESSAGES = require("@errMessages");

  server.decorate("toolkit", "throw", (request, error) => {
    server.log("error", error);
    const errMessage = server.methods.translateError(request, error);

    if (Boom.isBoom(error)) {
      error.output.payload.message = errMessage;
      return error;
    }

    // Give account of duplicates in the collection arising from Mongoose
    if (error.code === 11000) return Boom.conflict(errMessage);

    // Process errors coming from JsonWebToken
    if (error.name === "TokenExpiredError" || error.name === "NotBeforeError")
      return Boom.notAcceptable(errMessage);
    if (error.name === "JsonWebTokenError") return Boom.badData(errMessage);

    const boom = new Boom.Boom(errMessage, { statusCode: 500 });
    boom.output.payload.message = errMessage;
    return boom;
  });

  return server;
};

exports.plugin = {
  register,
  name: "boomer",
  description:
    "Creates throw decoration for the handler object, analyzes errors and returns them translated and properly formatted.",
  version: require("@pack").version,
  once: true,
};
