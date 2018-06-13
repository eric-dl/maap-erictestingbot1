var log = require('loglevel');
var bot = require('./ssbotbuilder.js');

var service;

// Set custom logging level for sdk modules ("TRACE", "DEBUG", "INFO", "WARN", "ERROR")
log.getLogger("authtoken").setLevel("DEBUG");
log.getLogger("ssbotbuilder").setLevel("DEBUG");

// Set logging level for app
log.setLevel("DEBUG");

var util = require('util');
var AuthToken = require('./authtoken');

function CustomAuthToken() {
  return {
    fetchAccessToken: function(){
      log.debug('custom fetchtoken');

    },
    getAccessToken: function() {
      log.debug("custom getaccesstoken");
      return "BSDHDIOWODLSJSBGHA";
    },
  }
}

util.inherits(CustomAuthToken, AuthToken);

var options = {
  botID: '4be9-jYJR86QMOrNSb__OA',
  accesstoken: '9QxTf4fYTQmCudtB_NapjbduWJEf_AnlGDoZQUSgCd4',
  botservice: '127.0.0.1',
  apipath: "/bot/v1/",
  clientconfig: {
    "scheme": "http",
    "connpoolsize": 10
  },
  serverconfig: {
    "scheme": "http",
    "port": 3000,
    "webhook": "/bot/message"
  }
};

//Setup Web Server
bot.createService(options, function(err, webserver) {
  // store webserver instance to close it when needed
  service = webserver;
  if (!err) {
    bot.listen('webhook', onWebhookListener);
  }
}, CustomAuthToken());

var onWebhookListener = function (message) {
  log.debug("+++webhook callback received+++");
  log.debug("message: ", JSON.stringify(message));

  if (!message) {
    log.error("!!!empty message!!!");
    return;
  }

  if (message.event == "message") {
    if (message.RCSMessage.textMessage) {
      if(message.RCSMessage.textMessage == "close") {
        log.debug("closing webserver");
        service.close();
        return;
      }
      bot.read(message.RCSMessage.msgId, function(err, res, body) {
        if (res) log.debug('res: '+ res.statusCode);
        if (err)
          log.error('Error sending Read Report: '+ err);
      });
      bot.typing(message.messageContact, "active", function(err, res, body) {
        if (res) log.debug('res: '+ res.statusCode);
        if (err)
          log.error('Error sending Typing: '+ err);
      });

      var data = {
        "RCSMessage": {
          "textMessage": "Received your message"
        }
      }

      bot.reply(message, data, function(err, res, body) {
        if (res) log.debug('res: '+ res.statusCode);
        if (err)
          log.error('Error sending Reply: '+ err);
      });
    }
  }
}
