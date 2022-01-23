"use strict";

module.exports = class App extends require("@appFactory") {
  async post({ payload }) {
    const user = await this.mongo("User").create(payload);
    return { response: { user }, code: 201 };
  }

  async patch({ params, auth, payload }) {
    const user = await this.mongo("User").findByIdAndUpdate(
      params.id,
      payload,
      { new: true, runValidators: true, useFindAndModify: true }
    );
    return { response: { user }, code: 200 };
  }

  async delete({ params, auth }) {}
};
