"use strict";

module.exports = class App extends require("@appFactory") {
  async post({ payload, auth }) {
    const { _id: creator } = auth.credentials.user;
    const card = await this.mongo("Card").create({ ...payload, creator });
    return { response: { card }, code: 201 };
  }

  async get10() {
    const cards = await this.mongo("Card").find({}).limit(10);
    return { response: { cards }, code: 200 };
  }

  async play({ params, payload, auth }) {
    let message = "OH! Sorry, wrong answer. Try again.";
    const { _id } = auth.credentials.user;
    const card = await this.mongo("Card").findById(params.id);
    if (!card) throw this.Boom.notFound();

    if (_id.toString().includes(card.creator.toString())) {
      message = "DON'T CHEAT! You already know this answer";
    } else {
      if (card.rightAnswer === payload.rightAnswer) {
        const user = await this.mongo("User").findById(_id);
        await user.increaseScore();
        message = "CONGRATS! The answer is correct. You earned 10 points";
      }
    }

    return { response: { message }, code: 200 };
  }
};
