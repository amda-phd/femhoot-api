"use strict";

require("module-alias/register");

const { start } = require("@server");

start()
  .then(() => {})
  .catch((error) => {
    console.log("Something went wrong");
    console.error(error);
  });

// TODO: Login & Sign up
// TODO: A route that allows to check if the choosen answer by the player is correct.
// TODO: A route that returns a set of 10 questions (randomly selected from a JSON, these can be fake questions) with 4 possible answers.
// TODO: Question model
// TODO: Question CRUD
