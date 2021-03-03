let firebase = require('./firebase')

exports.handler = async function(event) {
  console.log('hello from the back-end!')
  let response = await fetch(`https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fwallstreetbets%2F.rss`)
  let json = await response.json()
  //let feed = json.results
  console.log(json)

  return {
    statusCode: 200,
    body: JSON.stringify(json)
  }
}