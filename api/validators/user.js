"use strict";

const Joi = require("joi");

const name = Joi.string().min(3).max(50).required();
const email = Joi.string().email().required();

const post = Joi.object({
  name,
  email,
});

module.exports = { post };
