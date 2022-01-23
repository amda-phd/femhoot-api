"use strict";

const { join } = require("path");
const { readdirSync } = require("fs");

const register = (server) => {
  server.validator(require("joi"));
  const validators = {};
  const files = readdirSync(join(__dirname, "../", "validators"));
  files.forEach((file) => {
    const fileName = file.split(".")[0];
    validators[fileName] = require(`Validators/${fileName}`);
  });

  server.expose(validators);
};

exports.plugin = {
  register,
  name: "validators",
  description:
    "Scans the /validators folder and adds the objects found there to server.plugins.validators for further use across the app.",
  version: require("@pack").version,
  once: true,
};
