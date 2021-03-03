firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('signed in')
    let response = await fetch(`https://feed2json.org/convert?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fwallstreetbets%2F.rss`)
    let json = await response.json()
    //let feed = json.results
    
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
  for (let i = 0; i<json.items.length; i++) {
    
    let post = {
      postTitle: `${json.items[i].title}`,
      postDateStamp: `${json.items[i].date_published}`,
      content_html: `${json.items[i].content_html}`
    }
    posts.push(post)
  }
  console.log(posts)
}

