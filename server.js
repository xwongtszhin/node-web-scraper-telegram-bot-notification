var every       = require('schedule').every;
var express     = require('express');
var request     = require('request');
var cheerio     = require('cheerio');
var config      = require('./config.js');
var _           = require('lodash');
var TelegramBot = require('node-telegram-bot-api');
var app         = express();

var targetUrl = 'https://www.biyroamer.com/category/adidas/ultra-boost';
var token = config.telegram.token;
var bot = new TelegramBot(token);
var lastSend;

every('5s').do(function() {
    var data = [];
    request(targetUrl, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            $('.post-title.entry-title').first().filter(function(index, value){
                data.push({"link": value.children[0].attribs.href, "word": value.children[0].children[0].data, "datetime": null});
            });
            $('.entry-date.updated').first().filter(function(index, value){
                data[index].datetime = value.attribs.datetime;
            });
            if (lastSend != new Date(data[0].datetime).getTime()){
                var chatID = []; 
                bot.getUpdates().then(function(result){
                    for(i in result){
                        chatID = _.union(chatID, [result[i].message.chat.id]);
                    }
                    for( id in chatID){
                        bot.sendMessage(chatID[id], data[0].word + "\n" + data[0].link + "\n" + data[0].datetime).then(function(resp){
                            
                        }).catch(function(error) {
                            if (error.response && error.response.statusCode === 403) {
                                 console.log('bot was blocked by the user');
                        }});
                    }
                });
                lastSend = new Date(data[0].datetime).getTime();
            }
        }
    });
});

app.listen('8081');
exports = module.exports = app;