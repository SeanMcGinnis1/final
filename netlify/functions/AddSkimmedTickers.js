let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let data = [
      {ticker: 'APPL', count: 5},
      {ticker: 'GME', count: 4},
      {ticker: 'MSFT', count: 1}
  ]
  console.log(data)



  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}