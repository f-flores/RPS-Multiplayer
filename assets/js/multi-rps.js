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
var database;

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
  // ------------------------------------------------------------------------------------------
  // setupPlayer() takes in numPlayer as a parameter and adds the numPlayer leaf to the
  // players branch
  //
  setupPlayer(name) {
    console.log("in setupPlayer(): " + name);
    $("#player-form").hide();
    $("#start-btn").hide();
    database.ref("players/").once(
      "value", (snapshot) => {
        var sv = snapshot.val(),
            numPlayers = snapshot.numChildren(),
            player2Exists = snapshot.child("2").exists(),
            msg = "";

        // game is full, player is not allowed to join game
        if (numPlayers === 2) {
          msg = "Game condition of two players is already fulfilled. Sorry, please try later.";
          $("#player-welcome-message").html("<p class=\"text-center\">" + msg + "</p>");
        } else if (numPlayers === 1 && player2Exists) {
          // reassign player1 and do NOT rewrite player 2
          this.assignPlayer("1", name);
          this.setTurn(1);
        } else if (numPlayers === 1) {
          this.assignPlayer("2", name);
          this.setTurn(1);
        } else if (numPlayers === 0) {
          this.assignPlayer("1", name);
        }
      },
      (errorObject) => {
            console.log("Errors handled: " + JSON.stringify(errorObject));
      }
    );
  },
  // ------------------------------------------------------------------------------------------
  // assignPlayer() takes in numPlayer as a parameter and adds the numPlayer leaf to the
  // players branch
  //
  assignPlayer(numPlayer, pName) {
    var playerPath = "players/" + numPlayer.toString();

    // sets up player information
    database.ref(playerPath).set(
      {
        "choice": "",
        "losses": 0,
        "playerName": pName,
        "wins": 0
      },
      (errorObject) => {
            console.log("Errors handled: " + JSON.stringify(errorObject));
      }
    );

    // disconnects player if player reloads page
    database.ref(playerPath).onDisconnect().
                        remove();
    // setup html player greeting and name using PlayerConsole prototype
    if (numPlayer === "1") {
      player1 = new PlayerConsole(pName, "1");
      player1.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
    } else if (numPlayer === "2") {
      player2 = new PlayerConsole(pName, "2");
      player2.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
    }
  },
  isPlayer1loggedin() {
    database.ref("players/").once("value").
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

   return this.player2loggedin;
  },
  areBothPlayersLoggedin() {
    this.bothPlayersSelected = this.isPlayer1loggedin() && this.isPlayer2loggedin();

    return this.bothPlayersSelected;
  },
  setTurn(turn) {
    database.ref("turn/").set(turn);
  }
};

// ------------------------------------------------------------------------------------------
// PlayerConsole() is a prototype to assist in dynamically changing a player's html elements.
//
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

  this.otherPlayerName = () => {
    var otherName = "",
        sv;

    database.ref("players/" + this.otherPlayer).once("value", (snapshot) => {
      sv = snapshot.val();
      if (sv !== null) {
        otherName = sv.playerName;
      }
    });

    return otherName;
  };
  console.log("this.otherPlayerName: " + this.otherPlayerName());

  this.displayName = () => {
    if (this.name === "undefined") {
      $("#player" + num.toString()).text("Waiting for player " + this.otherPlayer + "...");
    } else {
      $("#player" + num.toString()).text(this.name);
    }
  };
  this.showOpponentName = () => {
    if (this.name === "undefined") {
      $("#player" + this.otherPlayer).text("Waiting for player " + this.otherPlayer + "...");
    } else {
      $("#player" + this.otherPlayer).text(this.otherPlayerName);
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

  // Create a variable to reference the database
  database = firebase.database();

  // ------------------------------------------------------------------------------------------
  // When a player is added to the game, display that player's initial information:
  // Name, Number of wins (0), Number of losses (0)
  database.ref("players/").on(
    "child_added", (childSnapshot) => {
      var childsv = childSnapshot.val(),
          numPlayer = childSnapshot.key,
          scoreText = "";

      console.log("on players child added, childsv, parent" + JSON.stringify(childsv), numPlayer);
      $("#player" + numPlayer.toString()).html(childsv.playerName);
      scoreText = "Wins: " + childsv.wins + "  Losses: " + childsv.losses;
      $("#score" + numPlayer.toString()).html(scoreText);
    },
    (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );


  // remove turn from database on disconnect
  // database.ref("turn/").onDisconnect.remove();

  // cancel player events and remove player on disconnect
  // rpsPlayersRef.onDisconnect.cancel();
  // rpsPlayersRef.onDisconnect.remove();

  // Main Game Loop
  // initGame();
  $("#start-btn").on("click", (event) => {
    var playerName;

    console.log("in #start-btn");
    event.preventDefault();
    playerName = $("#player-name").val().
                                    trim();
    rpsGame.setupPlayer(playerName);

    $("#player-name").val("");
  });

  // End of document.ready(function)
});

 // -----------------------------------------------------------------------------------------
  // setupPlayer1() displays player1 console
  //
 // function setupPlayer1(playerName) {
 //   var dbPath;

 //   console.log("Player 1 screen");
 //   player1 = new PlayerConsole(playerName, "1");

 //   dbPath = "/players/1";
    // $("#player1").text(playerName);
   // player1.displayName();

   // player1.hideNameBtn();
   // player1.welcomeMsg("Hi " + playerName + ", you are player " + player1.playerNum);
    // player2.showOpponentName();

    // setup player information
   // database.ref(dbPath).update(
   //   {
   //     "choice": "",
   //     "losses": player1.losses,
   //     playerName,
   //     "wins": player1.wins
   //   },
   //   (errorObject) => {
   //     console.log("Errors handled: " + JSON.stringify(errorObject));
   //   }
   // );
   // console.log("player1 at end of SetupPlayer1(): " + JSON.stringify(player1));
 // }

// -----------------------------------------------------------------------------------------
// setupPlayer2() displays player2 console
//
  // function setupPlayer2(playerName) {
   // var dbPath;

   // console.log("Player 2 screen");

   // dbPath = "/players/2";
    // $("#player1").text(playerName);
   // player2.displayName();

   // player2.hideNameBtn();
   // player2.welcomeMsg("Hi " + playerName + ", you are player " + player2.playerNum);

    // setup player information
   // database.ref(dbPath).update(
   //   {
   //     "choice": "",
   //     "losses": player2.losses,
   //     playerName,
   //     "wins": player2.wins
   //   },
   //   (errorObject) => {
   //     console.log("Errors handled: " + JSON.stringify(errorObject));
   //   }
   // );
   // console.log("player2 at end of SetupPlayer2(): " + JSON.stringify(player2));

  // }

   // if (getGameState() === "fulfilled") {
 //   console.log("GAME CONDITIONS ARE FULFILLED.");
 //   console.log("RPS GAME CAN START");
 // } else if (getGameState() === "created") {
 //   console.log("GAME CREATED BUT CANNOT START YET");
 // } else {
 //   console.log("GAME CANNOT START YET");
 // }

 // function initGame() {
 // console.log("in initGame()");
 // rpsGame.isPlayer1loggedin();
 // rpsGame.isPlayer2loggedin();
 // setGameState("none");
  // is user1 present?
 // console.log("isPlayer1loggedin() in initGame(): " + rpsGame.isPlayer1loggedin());
  // is user2 present?
 // console.log("isPlayer2loggedin() in initGame(): " + rpsGame.isPlayer2loggedin());
  // if both players present, display game full, please wait
 // console.log("areBothPlayersLoggedin() in initGame(): " + rpsGame.areBothPlayersLoggedin());
 // console.log("Game state: " + rpsGame.getState());
// }

// function getGameState() {
//  var gState;

//  database.ref("state/").on(
//    "value", (snapshot) => {
//      var sn = snapshot.val();

//      console.log("snapshot getGameState(): " + JSON.stringify(sn));

//      gState = sn.gameState;
//  },
//    (errorObject) => {
//      console.log("Errors handled: " + JSON.stringify(errorObject));
//    }
//  );

    // refChild,
//  return gState;
// }

 // function setGameState(state) {
 //  database.ref("state/").update(
 //   {"gameState": state},
 //   (errorObject) => {
 //     console.log("Errors handled: " + JSON.stringify(errorObject));
 //   }
 // );
// }