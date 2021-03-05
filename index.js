firebase.auth().onAuthStateChanged(async function(user) {
  let db = firebase.firestore()
  let historicalPosts = await db.collection('posts').get()


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

    parsecontent(json)

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



function parsecontent(json) {
 
  var posts = []
  var wordsTitle = []
  var word = ""

  for (let i = 0; i<json.items.length; i++) {
    
    let post = {
      postTitle: `${json.items[i].title}`,
      postDateStamp: `${json.items[i].date_published}`,
      postKey: `${json.items[i].title}${json.items[i].date_published}`,
      content_html: `${json.items[i].content_html}`
    }
    posts.push(post)
  }
  //console.log(posts)
  //check posts for duplicate entries already stored in firebase
  newPosts(posts)
  //find upper case words
  for (let i = 0; i<posts.length; i++) {
  
    wordsTitle.push(
      cleanWord(posts[i].postTitle.split(" "))
      )
  }
  console.log(wordsTitle)
}

async function newPosts(posts) {
   //check if postkey is in firebase already
   //adds in the postkeys into firebase
   for (let i = 0; i<posts.length; i++) {
      // let docRef = await db.collection('posts').add({ 
      //   movieID: posts[i].postKey 
      // })
  // else proceed
  }
}


function cleanWord(array){
  var uppercaseWords = [""]
  for (let i = 0; i<array.length; i++) {
    var titleWord = array[i].replace("$", '').replace("!", '').replace("#", '')
    if (isUpperCase(titleWord)){
      uppercaseWords.push(titleWord)
     }
  }  
  return uppercaseWords
}

function isUpperCase(str) {
  return str === str.toUpperCase()
}

