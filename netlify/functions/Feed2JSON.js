let firebase = require('./firebase')
let fetch = require('node-fetch')

exports.handler = async function(event) {
let response = await fetch('https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fwallstreetbets%2F.rss')
let json = await response.json()
return {
statusCode: 200,
body: JSON.stringify(json)
 }
}