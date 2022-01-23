"use strict";

module.exports = class App extends require("@appFactory") {
  async post({ payload }) {
    const user = await this.mongo("User").create(payload);
    return { response: { user }, code: 201 };
  }

  async get({ params }) {
    const user = await this.mongo("User").findById(params.id);
    if (!user) throw this.Boom.notFound("USER_NOT_FOUND");
    return { response: { user }, code: 200 };
  }

  async patch({ params, auth, payload }) {
    const user = await this.mongo("User").findByIdAndUpdate(
      params.id,
      payload,
      { new: true, runValidators: true, useFindAndModify: true }
    );
    if (!user) throw this.Boom.notFound("USER_NOT_FOUND");
    return { response: { user }, code: 200 };
  }

  async delete({ params, auth }) {
    const user = await this.mongo("User").findByIdAndDelete(params.id, {
      useFindAndModify: true,
    });
    if (!user) throw this.Boom.notFound("USER_NOT_FOUND");
    return { code: 204 };
  }
};
