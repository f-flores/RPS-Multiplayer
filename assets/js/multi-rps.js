// --------------------------------------------------------------------------------------------
// File name: multi-rps.js
// Description: This is an implementation of a two player rock, paper, scissor game, using
//  firebase.
// Date: April, 2018
// Author: Fabian Flores
//
// --------------------------------------------------------------------------------------------

// /* global firebase: true */
var firebase;

// Initialize Firebase
var config = {
  "apiKey": "AIzaSyDZN1lB6rw7fFBpObj49tSNQfW2yXyJzz4",
  "authDomain": "multi-rps-88d44.firebaseapp.com",
  "databaseURL": "https://multi-rps-88d44.firebaseio.com",
  "projectId": "multi-rps-88d44",
  "storageBucket": "multi-rps-88d44.appspot.com",
  "messagingSenderId": "682358558557"
};

firebase.initializeApp(config);

$(document).ready(() => {
// -----------------------------------------------------------------------------------------
// initializes rpsGame

// ---------------------------------------------------------------------------------------------
// VARIABLES
//
var player1, player2;
var database, rpsPlayersRef, rpsTurnRef;

var GAMESTATE = "none";

// a game object for rock, paper scissors game
var rpsGame = {
  "activePlayer": "Waiting...",
  "opponent": "Waiting...",
  "choice": ["r", "p", "s"],
  "choiceVisible": false,
  "player1loggedin": "",
  "player2loggedin": "",
  "turn": 0,
  "losses": 0,
  "wins": 0,
  "gameState": "none",
  setPlayer(name) {
    console.log("in setPlayer(): " + name);
    $("#start-btn").hide();
  },
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
    return getGameState();
  }
};

// firebase.initializeApp(config);
//
// Create a variable to reference the database
database = firebase.database();

// Players branch
rpsPlayersRef = database.ref("/players");

// Turns branch
rpsTurnRef = database.ref("/turn");

// database.ref();

// cancel player events and remove player on disconnect
// rpsPlayersRef.onDisconnect.cancel();
// rpsPlayersRef.onDisconnect.remove();

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
    if (this.name === "undefined") {
      $("#player" + num.toString()).text("WAITING OTHER");
    } else {
      $("#player" + num.toString()).text(this.name);
    }
  };
  this.showOpponentName = () => {
    if (this.name === "undefined") {
      $("#player" + this.otherPlayer).text(this.name);
    } else {
      $("#player" + this.otherPlayer).text("HELLO SHOW OPPONENT");
    }
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


function getGameState() {
  var gState;

  database.ref("state/").on(
    "value", (snapshot) => {
      var sn = snapshot.val();

      console.log("snapshot getGameState(): " + JSON.stringify(sn));

      gState = sn.gameState;
  },
    (errorObject) => {
      console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );

    // refChild,
  return gState;
}

function setGameState(state) {
  database.ref("state/").update(
    {"gameState": state},
    (errorObject) => {
      console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );
}


  function initGame() {
    console.log("in initGame()");
    rpsGame.isPlayer1loggedin();
    rpsGame.isPlayer2loggedin();
    setGameState("none");
    // is user1 present?
    console.log("isPlayer1loggedin() in initGame(): " + rpsGame.isPlayer1loggedin());
    // is user2 present?
    console.log("isPlayer2loggedin() in initGame(): " + rpsGame.isPlayer2loggedin());
    // if both players present, display game full, please wait
    console.log("areBothPlayersLoggedin() in initGame(): " + rpsGame.areBothPlayersLoggedin());
    console.log("Game state: " + rpsGame.getState());
  }

  // -----------------------------------------------------------------------------------------
  // setupPlayer1() displays player1 console
  //
    function setupPlayer1(playerName) {
      var dbPath;

      console.log("Player 1 screen");
      player1 = new PlayerConsole(playerName, "1");

      dbPath = "/players/1";
      // $("#player1").text(playerName);
      player1.displayName();

      player1.hideNameBtn();
      player1.welcomeMsg("Hi " + playerName + ", you are player " + player1.playerNum);
      // player2.showOpponentName();

      // setup player information
      database.ref(dbPath).update(
        {
          "choice": "",
          "losses": player1.losses,
          playerName,
          "wins": player1.wins
        },
        (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
        }
      );
      console.log("player1 at end of SetupPlayer1(): " + JSON.stringify(player1));
    }

  // -----------------------------------------------------------------------------------------
  // setupPlayer2() displays player2 console
  //
    function setupPlayer2(playerName) {
      var dbPath;

      console.log("Player 2 screen");

      dbPath = "/players/2";
      // $("#player1").text(playerName);
      player2.displayName();

      player2.hideNameBtn();
      player2.welcomeMsg("Hi " + playerName + ", you are player " + player2.playerNum);

      // setup player information
      database.ref(dbPath).update(
        {
          "choice": "",
          "losses": player2.losses,
          playerName,
          "wins": player2.wins
        },
        (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
        }
      );
      console.log("player2 at end of SetupPlayer2(): " + JSON.stringify(player2));

    }


  $("#start-btn").on("click", (event) => {
    var playerName;

    console.log("in #start-btn");
    event.preventDefault();

    playerName = $("#player-name").val().
                                    trim();
    // console.log("playerName: " + playerName);
    rpsGame.setPlayer(playerName);

    // console.log("isPlayer1loggedin() in #start-btn: " + rpsGame.isPlayer1loggedin());
    // console.log("in #start-btn getGameState call");
    getGameState();
    // if (rpsGame.areBothPlayersLoggedin()) {
    //  console.log("Game can start.");
    // } else if (!rpsGame.isPlayer1loggedin()) {

    //    setupPlayer1(playerName);
        // setGameState("created");
    // } else if (rpsGame.isPlayer1loggedin() && !rpsGame.isPlayer2loggedin()) {
    //    console.log("player1 and player2 logged in successfully.");
       // setupPlayer2(playerName);
    // }

    $("#player-name").val("");
    // End of "#start-btn"
  });


  // Main Game Loop
  initGame();
  // console.log("current game state: " + getGameState());

  // wait for game to start
  // if (getGameState() !== "fulfilled") {
  //  database.ref("players/").on("child_added", (childSnapshot) => {
  //    var childsv;

  //    childsv = childSnapshot.val();
  //    console.log("getGameState childSnapshot: " + JSON.stringify(childSnapshot));
  //    console.log("getGameState ref: " + childSnapshot.ref.key);
  //    console.log("getGameState parent of ref: " + childSnapshot.ref.parent.key);
  //    if (childSnapshot.ref.key === "1") {
  //      setGameState("created");
  //      if (rpsGame.isPlayer1loggedin()) {
  //        console.log("in player2 screen");
  //        console.log("getGameState if loop game has been created");
  //      }
        // player2.displayName();
        // setupPlayer2("PLAYER1");
  //    } else if (childSnapshot.ref.key === "2") {
  //      setGameState("fulfilled");
        // set turn = 0
  //    }
      // childsv.gameState = GAMESTATE;
  //  });
  // }
// Create a variable to reference the database
// database = firebase.database();
// database.ref();
  if (getGameState() === "fulfilled") {
    console.log("GAME CONDITIONS ARE FULFILLED.");
    console.log("RPS GAME CAN START");
  } else if (getGameState() === "created") {
    // create player
    // player2 = new PlayerConsole("Waiting for player2...", "2");
    // player2.showOpponentName();
    // setupPlayer2("Waiting for player2...");
    // show opponents name on active player's screen
    console.log("GAME CREATED BUT CANNOT START YET");
  } else {
    console.log("GAME CANNOT START YET");
  }

  // End of document.ready(function)
});