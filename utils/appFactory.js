"use strict";

module.exports = class AppFactory {
  constructor(server) {
    const { mongo } = server.methods.model;
    this.mongo = mongo;
    this.logger = (tags, payload) => server.log(tags, payload);

    this.Boom = require("@hapi/boom");
  }
};
