"use strict";

module.exports = class App extends require("@appFactory") {
  constructor(server) {
    super(server);

    this.Crumb = (request, h) => server.plugins.crumb.generate(request, h);
  }

  create(request, h) {
    return { response: { crumb: this.Crumb(request, h) }, code: 201 };
  }
};
