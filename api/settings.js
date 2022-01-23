"use strict";

module.exports = {
  app: {
    headers: {
      csrf: "x-csrf-token",
      language: "accept-language",
    },
    documentation: {
      path: "/documentation",
    },
  },
};
