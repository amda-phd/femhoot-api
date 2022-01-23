"use strict";

const Joi = require("joi");

Joi.objectId = require("joi-objectid")(Joi);

const name = Joi.string().min(3).max(50);
const email = Joi.string().email();
const id = Joi.object({
  id: Joi.objectId().required(),
});

const post = Joi.object({
  name: name.required(),
  email: email.required(),
});

const patch = Joi.object({ name, email });

module.exports = { post, patch, id };
