"use strict";

const register = (server) => {
  const { authenticate } = server.methods.Login;
  server.auth.scheme("token", () => ({ authenticate }));
  server.auth.strategy("default", "token");
  server.auth.default("default");
  return server;
};

exports.plugin = {
  register,
  name: "auth-token",
  description:
    "Sets bearer token authentication strategy as default through the app.",
  version: require("@pack").version,
  once: true,
};
