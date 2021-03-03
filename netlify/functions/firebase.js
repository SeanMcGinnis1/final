const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
apiKey: "AIzaSyDnSPNEs1Hmd1LuB9IvHt26ooD1XiVsZco",
authDomain: "homework6-66e9e.firebaseapp.com",
projectId: "homework6-66e9e",
storageBucket: "homework6-66e9e.appspot.com",
messagingSenderId: "189253002479",
appId: "1:189253002479:web:914d0e027b658233c9a71a"
} // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase