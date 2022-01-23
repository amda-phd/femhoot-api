"use strict";

const { is } = require("@helpers");

const register = (server) => {
  server.method("is", is);
};

exports.plugin = {
  register,
  name: "helpers",
  description: "Loads general helper methods",
  version: require("@pack").version,
  once: true,
};
