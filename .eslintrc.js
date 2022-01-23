"use strict";

module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@hapi/recommended", "prettier"],
  rules: {
    "@hapi/scope-start": "off",
  },
};
