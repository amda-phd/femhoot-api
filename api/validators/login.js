"use strict";

const Joi = require("joi");

const email = Joi.string().email();

module.exports = { email };
