let firebase = require('./firebase')


exports.handler = async function(event) {
  let db = firebase.firestore()
  //Pull freshdata from firebase
  let data = []
  let freshDataQuery = await db.collection('freshdata').get()
  let freshData = freshDataQuery.docs

  let historicalTickersQuery = await db.collection('countedtickers').get()
  let historicalTickers = historicalTickersQuery.docs

  

 console.log(freshData.length)
  console.log('---------------')
  //process data
  for (let i=0; i<freshData.length; i++) {
    let FD = freshData[i].data()
    console.log(FD)
    let present = false
    

    for (let j=0; j<historicalTickers.length; j++) {
        let T = historicalTickers[j].data()
        console.log(FD.ticker)
        console.log(FD.count)
        console.log(T.ticker)
        console.log(T.count)
        console.log('----------------')
        if (T.ticker == FD.ticker){
            let x = T.count
            let y = FD.count
            let z = x + y
            console.log(`Z is ${z}`)
            let old = await db.collection('countedtickers').doc(historicalTickers[j].id).delete()
            let New = await db.collection('countedtickers').add({
                count: z,
                ticker: FD.ticker
            })
            present = true
            //console.log(T.count)
        }

    }
    if (present == false) {
        let New = await db.collection('countedtickers').add({
                count: FD.count,
                ticker: FD.ticker
            })
    }
    //console.log(test.data())
    //items.count = items.count + data[i].count
    //console.log(selectedticker)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}