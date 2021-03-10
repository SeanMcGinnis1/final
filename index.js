firebase.auth().onAuthStateChanged(async function(user) {
  let db = firebase.firestore()
  
  if (user) {

     console.log('signed in')
 
    console.log(user.uid)
   
    db.collection('users').doc(user.uid).set({
      name: user.displayName,
      email: user.email
    })
    


    //Signed in message
    let NameQuery = await db.collection('users').where('email', '==', user.email).get()
    let Name = NameQuery.docs
    console.log(Name[0].data().name)
    document.querySelector('#signedIn').insertAdjacentHTML('beforeend',`${Name[0].data().name}
    `)

    //log out button
    let LogOutButton = document.querySelector(`#logOut`)
    LogOutButton.addEventListener('click', async function(event) {
      event.preventDefault()
      firebase.auth().signOut()
      console.log(`Log Out button clicked!`)
    })

    //runs the processing of the reddit wallstreetbets feed
    feedResponse = await fetch('/.netlify/functions/feedProcessing')
    generateGraph(db,user)
     
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

    //hiding items while logged out
    document.querySelector('#newfavorite').classList.add('hidden')
    document.querySelector('#favorites').classList.add('hidden')
    document.querySelector('#mostMentioned').classList.add('hidden')
    document.querySelector('.signedIn').classList.add('hidden')
    document.querySelector('#list').classList.add('hidden')
    document.querySelector('#allcaps').classList.add('hidden')
  }
})


//Building out the listed tickers and mentions
async function generateGraph(db,user) {
//Steps for list:
console.log(user.uid)
//1) pull data from firebase
let countedTickersQuery = await db.collection('countedtickers').get()
let countedTickers = countedTickersQuery.docs
let First = {
  count: 0,
  ticker: ''
}
let Second = {
  count: 0,
  ticker: ''
}
let Third = {
  count: 0,
  ticker: ''
}
let Fourth = {
  count: 0,
  ticker: ''
}
let Fifth = {
  count: 0,
  ticker: ''
}
//2) sort top 5 most commented tickers
for (let q=0; q<countedTickers.length; q++) {
  //console.log(countedTickers[q].data())
  if (countedTickers[q].data().count > First.count) {
    Fifth.count = Fourth.count
    Fifth.ticker = Fourth.ticker
    Fourth.count = Third.count
    Fourth.ticker = Third.ticker
    Third.count = Second.count
    Third.ticker = Second.ticker
    Second.count = First.count
    Second.ticker = First.ticker
    First.count = countedTickers[q].data().count
    First.ticker = countedTickers[q].data().ticker
  } else if (countedTickers[q].data().count > Second.count) {
    Fifth.count = Fourth.count
    Fifth.ticker = Fourth.ticker
    Fourth.count = Third.count
    Fourth.ticker = Third.ticker
    Third.count = Second.count
    Third.ticker = Second.ticker
    Second.count = countedTickers[q].data().count
    Second.ticker = countedTickers[q].data().ticker
  } else if (countedTickers[q].data().count > Third.count) {
    Fifth.count = Fourth.count
    Fifth.ticker = Fourth.ticker
    Fourth.count = Third.count
    Fourth.ticker = Third.ticker
    Third.count = countedTickers[q].data().count
    Third.ticker = countedTickers[q].data().ticker
  } else if (countedTickers[q].data().count > Fourth.count) {
    Fifth.count = Fourth.count
    Fifth.ticker = Fourth.ticker
    Fourth.count = countedTickers[q].data().count
    Fourth.ticker = countedTickers[q].data().ticker
  } else if (countedTickers[q].data().count > Fifth.count) {
    Fifth.count = countedTickers[q].data().count
    Fifth.ticker = countedTickers[q].data().ticker
  }
}

// console.log(First)
// console.log(Second)
// console.log(Third)
// console.log(Fourth)
// console.log(Fifth)

//3) add inner html to show list
document.querySelector('.OL').innerHTML = `
<ol>
  <li>Top Tickers by Number of Mentions</li>
  <li>${First.ticker} has ${First.count} mentions</li>
  <li>${Second.ticker} has ${Second.count} mentions</li>
  <li>${Third.ticker} has ${Third.count} mentions</li>
  <li>${Fourth.ticker} has ${Fourth.count} mentions</li>
  <li>${Fifth.ticker} has ${Fifth.count} mentions</li>
</ol>
`
//Functionality for most mentioned return button
let MMButton = document.querySelector(`#mostMentioned`)
MMButton.addEventListener('click', async function(event) {
  event.preventDefault()
  console.log(`Most Mentioned button clicked!`)
  document.querySelector('.OL').innerHTML = `
  <ol>
    <li>Top Tickers by Number of Mentions</li>
    <li>${First.ticker} has ${First.count} mentions</li>
    <li>${Second.ticker} has ${Second.count} mentions</li>
    <li>${Third.ticker} has ${Third.count} mentions</li>
    <li>${Fourth.ticker} has ${Fourth.count} mentions</li>
    <li>${Fifth.ticker} has ${Fifth.count} mentions</li>
  </ol>
  `
})




let favoritesQuery = await db.collection('Favorites').where('userId', '==', user.uid).get()
let Favorites = favoritesQuery.docs

//Create functionality for favorites button

let FButton = document.querySelector(`#favorites`)
FButton.addEventListener('click', async function(event) {
  event.preventDefault()
  console.log(`Favorites button clicked!`)
  let favoritesQuery = await db.collection('Favorites').where('userId', '==', user.uid).get()
  let Favorites = favoritesQuery.docs

  let favs = []

  for (let m = 0; m < Favorites.length; m++) {
    for (let l = 0; l<countedTickers.length; l++) {
        if (countedTickers[l].data().ticker == Favorites[m].data().ticker) {
        favs[m] = countedTickers[l].data().count
      }
    }
    console.log(favs)
    if (favs[m] == undefined) {
      favs[m]= 0
    }
  }

  if(Favorites.length == 0) {
    console.log('No Favorited Tickers to Show')
  }

  document.querySelector('.OL').innerHTML = `
  <ol>
  <li>Favorite Ticker Mentions</li>`

  console.log(Favorites.length)
  for (let u = 0; u<Favorites.length; u++) {
    document.querySelector('.OL').insertAdjacentHTML('beforeend',`
    <li>${Favorites[u].data().ticker} has ${favs[u]} mentions</li>
    `
  )}
})

//Functionality for Adding a new favorite
document.querySelector('form').addEventListener('submit', async function(event) {
  event.preventDefault()
  console.log(`A New Favorite was submitted!`)
  
  let newFav = document.querySelector('#newfavoriteticker').value
  //console.log(Favorites.length)
  if (newFav.length > 0 ) {
    let docRef = await db.collection('Favorites').doc(`${user.uid}-${newFav}`).set({
      ticker: newFav,
      userId: user.uid
    })
  } else {
    console.log('you already have 5 favorites or the ticker was invalid')
  }
  
})
}
