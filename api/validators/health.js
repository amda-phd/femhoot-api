"use strict";

const Joi = require("joi");

const api = Joi.boolean();
const mongo = Joi.boolean();
const health = Joi.object({ api, mongo });

module.exports = {
  ping: Joi.object({
    ping: Joi.string().valid("pong").required(),
  }),
  health,
};
