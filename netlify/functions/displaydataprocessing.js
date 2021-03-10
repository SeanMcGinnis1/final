let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let data = [] // sample only...
  //console.log(data)
  //1) pull data from firebase
  let countedTickersQuery = await db.collection('countedtickers').get()
  let countedTickers = countedTickersQuery.docs
  let First = {
    count: 0,
    ticker: ''
  }
  let Second = {
    count: 0,
   ticker: ''
  }
  let Third = {
    count: 0,
    ticker: ''
  }
  let Fourth = {
    count: 0,
    ticker: ''
  }
  let Fifth = {
    count: 0,
    ticker: ''
  }
  //2) sort top 5 most commented tickers
  for (let q=0; q<countedTickers.length; q++) {
    //console.log(countedTickers[q].data())
    if (countedTickers[q].data().count > First.count) {
      Fifth.count = Fourth.count
      Fifth.ticker = Fourth.ticker
      Fourth.count = Third.count
      Fourth.ticker = Third.ticker
      Third.count = Second.count
      Third.ticker = Second.ticker
      Second.count = First.count
      Second.ticker = First.ticker
      First.count = countedTickers[q].data().count
      First.ticker = countedTickers[q].data().ticker
    } else if (countedTickers[q].data().count > Second.count) {
      Fifth.count = Fourth.count
      Fifth.ticker = Fourth.ticker
      Fourth.count = Third.count
      Fourth.ticker = Third.ticker
      Third.count = Second.count
      Third.ticker = Second.ticker
      Second.count = countedTickers[q].data().count
      Second.ticker = countedTickers[q].data().ticker
    } else if (countedTickers[q].data().count > Third.count) {
      Fifth.count = Fourth.count
      Fifth.ticker = Fourth.ticker
      Fourth.count = Third.count
      Fourth.ticker = Third.ticker
      Third.count = countedTickers[q].data().count
      Third.ticker = countedTickers[q].data().ticker
    } else if (countedTickers[q].data().count > Fourth.count) {
      Fifth.count = Fourth.count
      Fifth.ticker = Fourth.ticker
      Fourth.count = countedTickers[q].data().count
      Fourth.ticker = countedTickers[q].data().ticker
    } else if (countedTickers[q].data().count > Fifth.count) {
      Fifth.count = countedTickers[q].data().count
      Fifth.ticker = countedTickers[q].data().ticker
    }
  }
  let response = [First,Second,Third,Fourth,Fifth]


  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}