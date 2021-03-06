let firebase = require('./firebase')
let fetch = require('node-fetch')

exports.handler = async function(event) {
    let db = firebase.firestore()
    let response = await fetch('https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fwallstreetbets%2F.rss')
    json = await response.json()

    var posts = []
    var cleanedWords = []
    var word = ""

    for (let i = 0; i<json.items.length; i++) {
    
        let post = {
            postTitle: `${json.items[i].title}`,
            postDateStamp: `${json.items[i].date_published}`,
            postKey: `${json.items[i].title}${json.items[i].date_published}`,
            content_html: `${json.items[i].content_html}`,
            newPost: true
        }
        posts.push(post)
    }
    //check posts for duplicate entries already stored in firebase and cleans them to identify words that might be tickers
    newPostsCleanPosts(posts, db)
    addSkimmedTickers (db)

    return {
        statusCode: 200,
        body: JSON.stringify(json)
    }
}

async function addSkimmedTickers (db) {
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
}


//checks pulled posts against historical posts in firestore database and sets newPost = false if post already has been tracked
async function newPostsCleanPosts(posts, db) {
    //check if postkey is in firebase already
    //adds in the postkeys into firebase
    //var cleanedWordsObj = new Object()
    var cleanedWords = []
    //await db.collection('posts').doc.delete()

    let historicalPostsQuery = await db.collection('posts').get()
    historicalPosts = historicalPostsQuery.docs
    for (let i = 0; i<posts.length; i++) {
        for (let h = 0; h<historicalPosts.length; h++) {
            if(posts[i].postKey == historicalPosts[h].data().postKey){
            posts[i].newPost = false // change to false
            }
        }
    }

    //find clean the words
    for (let i = 0; i<posts.length; i++) {
        if (posts[i].newPost == true) {
        let docRef = await db.collection('posts').add( 
            {
            postKey: posts[i].postKey,
            }
        )
        cleanedWords.push(
            cleanWord(posts[i].postTitle.split(" "))
        )
        }
    }
  
    tickerCount (cleanedWords, db)
}

//removes special characters and takes only all-caps words for potential tickers to be checked against firebase database
function cleanWord(array){
    var uppercaseWords = [""]
    for (let i = 0; i<array.length; i++) {
      var titleWord = array[i].replace("$", '').replace("!", '').replace("#", '').replace("?", '')
      if (isUpperCase(titleWord)){
        uppercaseWords.push(titleWord)
       }
    }  
    return uppercaseWords
  }
  
function isUpperCase(str) {
    return str === str.toUpperCase()
}


async function tickerCount (cleanedWords, db) {
    tickerList = []
    tickerCounted = []
    let knowntickersquery = await db.collection('knowntickers').get()
    knowntickers = knowntickersquery.docs
    for (let i = 0; i<knowntickers.length; i++) {
        tickerList.push([knowntickers[i].data().text,0])
    }
    
    for (let c = 0; c<cleanedWords.length; c++){
        for (let w = 0; w<cleanedWords[w].length; w++){
            for (let t = 0; t<tickerList.length; t++){
                if (cleanedWords[c][w]==tickerList[t][0]) {
                    tickerList[t][1] = tickerList[t][1] + 1
                    console.log (tickerList[t][0])
                    console.log ("counted")
                }   
            }        
        }
    }

    let freshdataquery = await db.collection('freshdata').get()
    freshdata = freshdataquery.docs
    for (let ff = 0; ff<freshdata.length; ff++) {
        await db.collection('freshdata').doc(freshdata[ff].id).delete()
    }
    console.log ("cleaned words")
    console.log (cleanedWords)
    console.log ("--------")
        
    
    for (let g = 0; g<tickerList.length; g++){
        if (tickerList[g][1]!= 0) {
            tickerCounted.push(tickerList[g])
            console.log(tickerList[g][0])
            console.log(tickerList[g][1])

            let docRef = await db.collection('freshdata').add( 
                {
                    ticker: `${tickerList[g][0]}`,
                    count: tickerList[g][1]
                }
            )
        }  
    } 

    //storing the counted tickers
    //fetch('/.netlify/functions/addskimmedtickers')
}
