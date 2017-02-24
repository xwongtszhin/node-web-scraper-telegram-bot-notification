var every       = require('schedule').every;
var express     = require('express');
var request     = require('request');
var cheerio     = require('cheerio');
var config      = require('./config.js');
var TelegramBot = require('node-telegram-bot-api');
var app         = express();

var targetUrl = config.targetUrl;;
var token = config.telegram.token;
var groupName = config.telegram.groupName;
var bot = new TelegramBot(token);
var lastSend;

app.get('/', function(req, res){
	return res.status(200).json({lastSend: lastSend});
});

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
		bot.sendMessage(groupName, data[0].word + "\n" + data[0].link + "\n" + data[0].datetime).then(function(resp){
		}).catch(function(error) {
		    if (error.response && error.response.statusCode === 403) console.log('bot was blocked by the user');
		});
	    lastSend = new Date(data[0].datetime).getTime();
            }
        }
    });
});

app.listen(process.env.PORT || 5000);
exports = module.exports = app;
