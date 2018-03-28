/* global firebase:true */
/* export rpsGame */

// an object for rock, paper scissors game
//
var rpsGame = {
  "activePlayer": "Waiting...",
  "opponent": "Waiting...",
  "choice": ["r", "p", "s"],
  "choiceVisible": false,
  "player1selected": false,
  "player2selected": false,
  "bothPlayersSelected": false,
  "turn": 0,
  "losses": 0,
  "wins": 0,
  isPlayer1selected() {
    var dbPath = "/players/1";

    database.ref(dbPath).once("value").
      then((snapshot) => {
        console.log("isPlayer1selected: " + JSON.stringify(snapshot));
        this.player1selected = snapshot.exists();
        console.log("this.player1selected: " + this.player1selected);
    });

    return this.player1selected;
  },
  isPlayer2selected() {
    var dbPath = "/players/2";

    database.ref(dbPath).once("value").
      then((snapshot) => {
        console.log("isPlayer2selected: " + JSON.stringify(snapshot));
        this.player2selected = snapshot.exists();
        console.log("this.player2selected: " + this.player2selected);
    });

    return this.player2selected;
  },
  areBothPlayersSelected() {
    this.bothPlayersSelected = this.player1selected && this.player2selected;

    return this.bothPlayersSelected;
  }
};

var player1console = {
  "item1": "",
  "item2": "",
  welcomeMsg(msg) {
    $("#player-welcome-message").html(msg);
  },
  playerEventMsg(msg) {
    $("#player-state-message").html(msg);
  },
  startSection(display) {
    if (display === "on") {
      $("#player-form").show();
    } else if (display === "off") {
      $("#player-form").hide();
    }
  }
};

var player2console = {
  "item1": "",
  "item2": ""
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

firebase.initializeApp(config);

// Create a variable to reference the database
database = firebase.database();
// database.ref();