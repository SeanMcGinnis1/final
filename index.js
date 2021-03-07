firebase.auth().onAuthStateChanged(async function(user) {
  let db = firebase.firestore()
  


  if (user) {
    // Signed in
     console.log('signed in')
    //let response = await fetch(`https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fwallstreetbets%2F.rss`)
    //let json = await response.json()
    //let feed = json.results
    
    

    //Sean: this calls the netlify function to fetch the JSON from WSB
     let response1 = await fetch('/.netlify/functions/Feed2JSON')
     let json = await response1.json()
    // console.log(json)
    //Sean: End of call to netlify function to fetch the JSON

    parsecontent(json,db)



  } else {
    // Signed out
    console.log('signed out')

    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())

    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'index.html'
    }

    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
  }
})



async function parsecontent(json, db) {

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
  console.log(posts)
  console.log("check clean")
  console.log(cleanedWords)
  console.log("check clean")
  cleanedWordsObj = cleanedWords
  tickerCount (cleanedWords, db)
}

async function tickerCount (cleanedWords, db) {
  tickerList = []
  tickerCounted = []
  let knowntickersquery = await db.collection('knowntickers').get()
  knowntickers = knowntickersquery.docs
    for (let i = 0; i<knowntickers.length; i++) {
      tickerList.push([knowntickers[i].data().text, 0])
    }
  console.log(tickerList)
  console.log(cleanedWords)
  for (let c = 0; c<cleanedWords.length; c++){
    for (let w = 0; w<cleanedWords[w].length; w++){
      //console.log(cleanedWords[c][w])
      for (let t = 0; t<tickerList.length; t++){
        if (cleanedWords[c][w]==tickerList[t][0]) {
          tickerList[t][1] = tickerList[t][1] + 1
        }   
      }        
    }
  }

  console.log(tickerList)
  let freshdataquery = await db.collection('freshdata').get()
  freshdata = freshdataquery.docs
    for (let ff = 0; ff<freshdata.length; ff++) {
      await db.collection('freshdata').doc(freshdata[ff].id).delete()
    }

  //undefined throws an error still
  for (let g = 0; g<tickerList.length; g++){
    if (tickerList[g][1]!= 0) {
      tickerCounted.push(tickerList[g])
      console.log(tickerList[g][0])
      console.log(tickerList[g][1])
     
      
      let docRef = await db.collection('freshdata').add( 
        {
          ticker: `${tickerList[g][0]}`,
          count: `${tickerList[g][1]}`
        }
      )
    }  
  } 
  console.log(tickerCounted)


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

