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
var player1, player2, currentPlayer;
var database;

// a game object for rock, paper scissors game
var rpsGame = {
  "activePlayer": "Waiting...",
  "opponent": "Waiting...",
  "choice": ["r", "p", "s"],
  "choiceVisible": false,
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
            player2Exists = snapshot.child(2).exists(),
            msg = "";

        // game is full, player is not allowed to join game
        if (numPlayers === 2) {
          msg = "Game condition of two players is already fulfilled. Sorry, please try later.";
          $("#player-welcome-message").html("<p class=\"text-center\">" + msg + "</p>");
        } else if (numPlayers === 1 && player2Exists) {
          // reassign player1 and do NOT rewrite player 2
          this.assignPlayer(1, name);
          this.setTurn(1);
          currentPlayer = 1;
        } else if (numPlayers === 1) {
          this.assignPlayer(2, name);
          this.setTurn(1);
          currentPlayer = 2;
        } else if (numPlayers === 0) {
          this.assignPlayer(1, name);
          currentPlayer = 1;
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
    if (numPlayer === 1) {
      player1 = new PlayerConsole(pName, 1);
      player1.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
      console.log("player1: " + JSON.stringify(player1));
      console.log("assignPlayer case 1: currentPlayer: " + currentPlayer);
    } else if (numPlayer === 2) {
      player2 = new PlayerConsole(pName, 2);
      player2.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
      // currentPlayer = parseInt(player2.playerNum, 10);
      console.log("player2: " + JSON.stringify(player2));
      console.log("assignPlayer case 2: currentPlayer: " + currentPlayer);
    }
  },
  setTurn(turn) {
    database.ref("turn/").set(turn);

    // remove turn from database on disconnect
    // database.ref("turn/").onDisconnect.remove();
  }
};

function emptyConsole() {
  console.log("in emptyConsole()");
  $("#choices1, #game-results, #choices-2").empty();
  console.log("end emptyConsole()");
}

// ------------------------------------------------------------------------------------------
// PlayerConsole() is a prototype to assist in dynamically changing a player's html elements.
//
function PlayerConsole(name, num) {

  this.name = name;
  this.playerNum = num;
  this.losses = 0;
  this.wins = 0;

  // determine opponent 'num' by choosing 'other' number
  if (this.playerNum === 1) {
    this.otherPlayer = 2;
  } else {
    this.otherPlayer = 1;
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
  //
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

  // ------------------------------------------------------------------------------------------
  // When turn is set, determine which player's turn it is and wait for that players choice
  //
  database.ref("turn/").on(
    "value", (snapshot) => {
    var numberTurn = snapshot.val(),
        otherPlayer,
        currPlayerObj,
        otherPlayerObj;

    console.log("player1: " + JSON.stringify(player1));
    console.log("player2: " + JSON.stringify(player2));

    if (numberTurn === 1) {
      // empty both player's game consoles
      emptyConsole();
      otherPlayer = currentPlayer === 1
      ? 2
      : 1;
      console.log("in ref 'turn', turn value: , currentPlayer, otherPlayer:  " + numberTurn, currentPlayer, otherPlayer);
      // messages on turn1;
      if (numberTurn === currentPlayer) {
        $("#player-state-message").html("It is your turn to choose.");
        // show choices
      } else if (numberTurn === otherPlayer) {
        $("#player-state-message").html("Waiting for other player to choose.");
      } else {
        $("#player-state-message").html("");
      }
      // Show choices to player1, show wait for player2
    }
    // else if (numberTurn === 2) {
     //  handle secondPlayerTurn
   // } else if (numberTurn === 3){
      // handle outcome;
    // }
  },
    (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );


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