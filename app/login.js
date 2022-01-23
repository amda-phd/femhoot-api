"use strict";

const { sign, verify } = require("jsonwebtoken");

module.exports = class App extends require("@appFactory") {
  async authenticate({ raw }) {
    const { req } = raw;
    const { authorization } = req.headers;
    if (!authorization) throw this.Boom.unauthorized();
    const token = authorization.split("Bearer ")[1];
    if (!token) throw this.Boom.unauthorized();
    try {
      const decode = verify(token, process.env.JWT_SECRET);
      const user = await this.mongo("User").findById(decode._id);
      if (!user) throw this.Boom.unauthorized();
      return { credentials: { user } };
    } catch (error) {
      throw this.Boom.unauthorized();
    }
  }

  async in({ payload }) {
    const user = await this.mongo("User").findOne(payload);
    if (!user) throw this.Boom.unauthorized();
    const token = sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXP,
    });
    return { response: { user, token }, code: 201 };
  }
};
