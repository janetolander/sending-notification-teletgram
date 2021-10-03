const cron = require('node-cron');
const express = require('express');
const https = require('https');
const Telegram = require('telegram-notify') ;
const Price = require( './Price').Price;
const Bitquery = require( './bitquery').Bitquery;


app = express();

var price = 0;
const BOT_TOKEN = "2047059161:AAHHjFvEhVnBd_nJBBMJNuLdGwvxv1SBRcM";
const CHAT_ID = "-1001426677742"

var priceClss = new Price();
var bitquery = new Bitquery();

var egaPrice = 0;
function generalDateRange(){
    var range=[]
    var today = new Date();
    var thisyear = today.getFullYear();
    var lastyear = thisyear
    var beforeDay = parseInt(today.getDate()) - 10;
    var thisMonth = today.getMonth()<10?'0'+(today.getMonth() + 1):(today.getMonth() + 1)
    var lastMonth = thisMonth
    if(beforeDay<=0)
     lastMonth = today.getMonth()<10?'0'+(today.getMonth()):(today.getMonth())
    if(thisMonth == '01'){
      lastMonth = '12'
      lastyear = thisyear - 1
    }
    
    var thisDay = today.getDate()<10?'0'+(today.getDate()):today.getDate();
    var lastDay = (beforeDay<10)?'0'+beforeDay:beforeDay
    if(beforeDay<=0)lastDay = 30 + beforeDay
    var thisMonthToday = thisyear+'-'+thisMonth+'-'+thisDay
    var lastMonthToday = lastyear+'-'+lastMonth+'-'+lastDay
    var Hours = today.getHours()<10?'0'+today.getHours():today.getHours()
    var Minutes = today.getMinutes()<10?'0'+today.getMinutes():today.getMinutes()
    var Seconds = today.getSeconds()<10?'0'+today.getSeconds():today.getSeconds();
    var time = Hours+ ":" + Minutes + ":" + Seconds
    var fromDateTime = lastMonthToday + 'T' + time + 'Z'
    var toDateTime = thisMonthToday + 'T' + time + 'Z'
    range.push(fromDateTime)
    range.push(toDateTime)
    return range
  }
  const dateRangeGlobal = generalDateRange()
app.get('/',(req, res) => {
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
                bitquery.loadBitqueryDataBTCbalance().then(btc=>{
                    
                    let btcBalance = btc.data.bitcoin.outputs[0].value;
                    bitquery.loadBitqueryDataUSDT(dateRangeGlobal[0]).then(usds =>{
                        let transaction_obj_arr = [];
                        let wb_usdt_arr = usds.data.ethereum.dexTrades;
                        wb_usdt_arr.map((arr, index) => {
                        // const ega_price = (sessionStorage.getItem('bnbBalance') / sessionStorage.getItem('egaBalance')) * (Number(arr.quotePrice))/100
                        const ega_price = (( (btcBalance*0.735) / Number(bal.egaBalance))*1000000) * Number(arr.quotePrice);
                            transaction_obj_arr.push({
                                d: arr.timeInterval.minute,
                                p: ega_price,
                                x: index,
                                y: ega_price,
                            });
                        })
                        var price = (transaction_obj_arr[transaction_obj_arr.length - 1].p).toFixed(11)

                        console.log('running a task every minute : ', price);
                        let notify = new Telegram({token:BOT_TOKEN, chatId:CHAT_ID})
                        var message = 'The current price of EGA token is ' + price + ' USD'
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
                })                
            })
        });
    }).on("error", (err) => {
          console.log("Error: " + err.message);
    });
    
});


app.listen(4000, () => {
    console.log('Server is running!');
 });
