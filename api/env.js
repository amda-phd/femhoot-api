"use strict";

const { join, resolve } = require("path");
const { existsSync } = require("fs");

const { is } = require("@helpers");

const { NODE_ENV: env } = process.env;
const path = join(resolve("./"), "config", `${env}.env`);
const envExists = existsSync(path);

module.exports = () => {
  if (!env || is("prod") || !envExists) return;
  require("dotenv").config({ path });
};
