"use strict";

require("module-alias/register");

const { start } = require("@server");

start()
  .then(() => {})
  .catch((error) => {
    console.log("Something went wrong");
    console.error(error);
  });

// TODO: Random array of cards.
// TODO: Question CRUD: edit and delete only for creator
