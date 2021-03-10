let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let data = [] // sample only...
  //console.log(data)

  for (let i=0; i<data.length; i++) {
    console.log(data[i])
    let docRef = await db.collection('knowntickers').add({
      text: data[i]
    })
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}