/* global firebase:true */
/* export rpsGame */

// an object for rock, paper scissors game
//
var rpsGame = {
  "activePlayer": "Waiting...",
  "opponent": "Waiting...",
  "choice": ["r", "p", "s"],
  "choiceVisible": false,
  "player1loggedin": "",
  "player2loggedin": "",
 //  "player2loggedin": false,
 // "bothPlayersSelected": false,
  "turn": 0,
  "losses": 0,
  "wins": 0,
  "gameState": "none",
  isPlayer1loggedin() {
    var dbPath = "players/";

    database.ref(dbPath).once("value").
      then((snapshot) => {

        console.log("isPlayer1loggedin fn: " + JSON.stringify(snapshot));
        this.player1loggedin = snapshot.child("1").exists();
        console.log("this.player1loggedin: " + this.player1loggedin);
    });

    return this.player1loggedin;
  },
  isPlayer2loggedin() {
    var dbPath = "/players/";

    database.ref(dbPath).once("value").
      then((snapshot) => {
        var player2Bool = snapshot.child("2").exists();

        console.log("isPlayer2loggedin fn: " + JSON.stringify(snapshot));
        console.log("player2Bool: " + player2Bool);
        this.player2loggedin = snapshot.child("2").exists();
        console.log("this.player2loggedin: " + this.player2loggedin);
    });

   // return this.player2loggedin;
   return this.player2loggedin;
  },
  areBothPlayersLoggedin() {
    this.bothPlayersSelected = this.isPlayer1loggedin() && this.isPlayer2loggedin();

    return this.bothPlayersSelected;
  },
  getState() {
    var state = "none";

    // if (this.isPlayer1loggedin() && this.isPlayer2loggedin()) {
    //  state = "fulfilled";
    // } else if (this.isPlayer1loggedin()) {
    //  state = "created";
    // }
    this.gameState = state;

    return state;
  }
};


// Initialize Firebase
var config = {
  "apiKey": "AIzaSyDZN1lB6rw7fFBpObj49tSNQfW2yXyJzz4",
  "authDomain": "multi-rps-88d44.firebaseapp.com",
  "databaseURL": "https://multi-rps-88d44.firebaseio.com",
  "projectId": "multi-rps-88d44",
  "storageBucket": "multi-rps-88d44.appspot.com",
  "messagingSenderId": "682358558557"
};
var database;

function PlayerConsole(name, num) {

  this.name = name;
  this.playerNum = num;
  this.losses = 0;
  this.wins = 0;

  // determine opponent 'num' by choosing 'other' number
  if (this.playerNum === "1") {
    this.otherPlayer = "2";
  } else {
    this.otherPlayer = "1";
  }
  // showP1Name() get player 1 name from database and display
  // showP2Name() get player 2 name from database and display
  this.displayName = () => {
    $("#player" + num.toString()).text(this.name);
  };
  this.showOpponentName = () => {
    $("#player" + this.otherPlayer).text(this.name);
  };
  this.welcomeMsg = (msg) => {
    $("#player-welcome-message").html("<p class=\"text-center\">" + msg + "</p>");
  };
  this.playerEventMsg = (msg) => {
    $("#player-state-message").html(msg);
  };
  this.hideNameBtn = () => {
    $("#player-form").hide();
  };
  this.showNameBtn = () => {
    $("#player-form").show();
  };
}

firebase.initializeApp(config);

// Create a variable to reference the database
database = firebase.database();
// database.ref();

function getGameState() {
  var gState = "",
      // refChild,
      childsv;

  database.ref("players/").on("child_added", (childSnapshot) => {
    childsv = childSnapshot.val();
    // refChild = childSnapshot.key;
    // do stuff with snapshot
    console.log("getGameState childSnapshot: " + JSON.stringify(childSnapshot));
    console.log("getGameState ref: " + childSnapshot.ref.key);
    console.log("getGameState parent of ref: " + childSnapshot.ref.parent.key);
    if (childSnapshot.ref.key === "1") {
      gState = "created";
    } else if (childSnapshot.ref.key === "2") {
      gState = "fulfilled";
    }
    childsv.gameState = gState;
  });

 return gState;
}

function setGameState(state) {
  database.ref("state/").update(
    {"gameState": "created"},
    (errorObject) => {
      console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );
}