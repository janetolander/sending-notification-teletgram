const cron = require('node-cron');
const express = require('express');
const https = require('https');
const Telegram = require('telegram-notify') ;
const Price = require( './Price').Price;


app = express();

var price = 0;
const BOT_TOKEN = "2047059161:AAHHjFvEhVnBd_nJBBMJNuLdGwvxv1SBRcM";
const CHAT_ID = "155390373"

var priceClss = new Price();

var egaPrice = 0;

const sendNotify = async () =>{
    if(sessionStorage.getItem('bnbBalance')){
      
    }
  }

// Schedule tasks to be run on the server.
cron.schedule(' */2 * * * *', async function () {
    https.get('https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=AFUNJEG3MDP4VF8XIMQSJVBAHTQ7M3KEXV', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let bnbPrice = JSON.parse(data).result.ethusd
            console.log(bnbPrice);
            priceClss.getPrice().then(bal =>{
            
                egaPrice = ((Number(bal.bnbBalance) / Number(bal.egaBalance)) * (Number(bnbPrice)))/100 ;
                console.log('running a task every minute : ', egaPrice);

                let notify = new Telegram({token:BOT_TOKEN, chatId:CHAT_ID})
                
                var message = 'The current price of EGA token is ' + egaPrice + ' USD'
                // await notify.send('The current price of EGA token is ' + transactions[transactions.length - 1].p);
                console.log('here is the notify object is :::::::::::::::::::::', message)
                const fetchOption = {}
                const apiOption = {
                    disable_web_page_preview:false,
                    disable_notification:false
                }
                notify.send(message,fetchOption, apiOption);
            })
        });
    }).on("error", (err) => {
          console.log("Error: " + err.message);
    });    
    
});

app.post('/',(req, res) => {
    https.get('https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=AFUNJEG3MDP4VF8XIMQSJVBAHTQ7M3KEXV', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let bnbPrice = JSON.parse(data).result.ethusd
            console.log(bnbPrice);
            priceClss.getPrice().then(bal =>{
            
                egaPrice = (Number(bal.bnbBalance) / Number(bal.egaBalance)) * (Number(bnbPrice)) ;
                console.log('running a task every minute : ', egaPrice);

                let notify = new Telegram({token:BOT_TOKEN, chatId:CHAT_ID})
                
                var message = 'The current price of EGA token is ' + egaPrice + ' USD'
                // await notify.send('The current price of EGA token is ' + transactions[transactions.length - 1].p);
                console.log('here is the notify object is :::::::::::::::::::::', message)
                const fetchOption = {}
                const apiOption = {
                    disable_web_page_preview:false,
                    disable_notification:false
                }
                notify.send(message,fetchOption, apiOption).then(response => {
                    res.send(response);
                });
            })
        });
    }).on("error", (err) => {
          console.log("Error: " + err.message);
    });
    
});


app.listen(4000);
