const every = require('schedule').every;
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const config = require('./config.js');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

const targetUrl = config.targetUrl;
const token = config.telegram.token;
const groupName = config.telegram.groupName;
const bot = new TelegramBot(token);
let lastDateTime;

every('5s').do(() => {

    request(targetUrl, (error, response, html) => {
        if (!error && response.statusCode == 200) {

            let $ = cheerio.load(html);
            let data = {};

            $('.post-title.entry-title')
                .first()
                .filter((index, value) => {
                    data.url = value.children[0].attribs.href;
                    data.title = value.children[0].children[0].data;
                });

            $('.entry-date.updated')
                .first()
                .filter((index, value) => {
                    data.dateTime = value.attribs.datetime;
                });

            let dateTime = new Date(data.dateTime).getTime();

            if (lastDateTime != dateTime)
                sendTelegramMessage(data);
        }
    })
});

var sendTelegramMessage = (data => {
    bot
        .sendMessage(
            groupName, [
                data.word,
                data.url,
                data.dateTime
            ].join('\n')
        )
        .then(resp => {
            lastDateTime = dateTime;
        })
        .catch(error => {});
});

app.listen(process.env.PORT || 3000);
exports = module.exports = app;