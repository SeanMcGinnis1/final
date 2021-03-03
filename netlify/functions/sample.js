let firebase = require('./firebase')

exports.handler = async function(event) {
  console.log('hello from the back-end!')
  let data = [] // sample only...
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}