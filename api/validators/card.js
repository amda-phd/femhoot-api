"use strict";

const Joi = require("joi");

Joi.objectId = require("joi-objectid")(Joi);

const question = Joi.string().min(10).max(240);
const answer = Joi.string().min(5).max(240);
const rightAnswer = Joi.number().min(1).max(4);
const id = Joi.object({
  id: Joi.objectId().required(),
});

const post = Joi.object({
  question: question.required(),
  possibleAnswers: Joi.array().items(answer).length(4).required(),
  rightAnswer: rightAnswer.required(),
});

module.exports = { post, rightAnswer: Joi.object({ rightAnswer }), id };
