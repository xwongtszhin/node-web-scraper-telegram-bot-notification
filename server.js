/* eslint-disable no-multi-assign */
const schedule = require('node-schedule');
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const targetUrl = process.env.TARGET_URL;
const token = process.env.TELEGRAM_TOKEN;
const groupName = process.env.TELEGRAM_GROUP_NAME;
const bot = new TelegramBot(token);
let latestId = 0;

schedule.scheduleJob('20 * * * * *', async () => {
  try {
    const response = await axios.get(`${targetUrl}/wp-json/wp/v2/posts`, {
      params: {
        per_page: 1,
        context: 'embed',
      },
    });

    if (response.status === 200) {
      const {
        date, title, link, id,
      } = response.data[0];
      if (id > latestId) {
        bot.sendMessage(groupName, [title, link, date].join('\n')).then(() => {
          latestId = id;
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
});

app.listen(process.env.PORT || 3000);
exports = module.exports = app;
