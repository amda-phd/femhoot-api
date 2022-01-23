"use strict";

module.exports = class App extends require("@appFactory") {
  async post({ payload }) {
    const user = await this.mongo("User").create(payload);
    return { response: { user }, code: 201 };
  }
};
