const every = require("schedule").every;
const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const app = express();

const targetUrl = process.env.TARGET_URL;
const token = process.env.TELEGRAM_TOKEN;
const groupName = process.env.TELEGRAM_GROUP_NAME;
const bot = new TelegramBot(token);
let lastDateTime;
let dateTime;

every("20s").do(() => {
  request(targetUrl, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      let $ = cheerio.load(html);
      let data = {};

      $(".post-title.entry-title")
        .first()
        .filter((index, value) => {
          data.url = value.children[0].attribs.href;
          data.title = value.children[0].children[0].data;
        });

      $(".entry-date.updated")
        .first()
        .filter((index, value) => {
          data.dateTime = value.attribs.datetime;
        });

      dateTime = new Date(data.dateTime).getTime();

      if (lastDateTime != dateTime) sendTelegramMessage(data);
    }
  });
});

const sendTelegramMessage = data => {
  bot
    .sendMessage(groupName, [data.title, data.url, data.dateTime].join("\n"))
    .then(resp => {
      lastDateTime = dateTime;
    })
    .catch(error => {});
};

app.listen(process.env.PORT || 3000);
exports = module.exports = app;
