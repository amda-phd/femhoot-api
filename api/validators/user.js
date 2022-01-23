"use strict";

const Joi = require("joi");

const name = Joi.string().min(3).max(50);
const email = Joi.string().email();

const post = Joi.object({
  name: name.required(),
  email: email.required(),
});

const patch = Joi.object({ name, email });

module.exports = { post, patch };
