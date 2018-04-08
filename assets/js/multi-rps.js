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
// ---------------------------------------------------------------------------------------------
// VARIABLES
//
var player1, player2, currentPlayer, otherPlayer, currPlayerObj, otherPlayerObj;
var database;

// a game object for rock, paper scissors game
var rpsGame = {
  "activePlayer": "Waiting...",
  "opponent": "Waiting...",
  "choice": ["r", "p", "s"],
  "choiceVisible": false,
  "turn": 0,
  "losses": 0,
  "ties": 0,
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
          // reassign player1 (do NOT rewrite player 2)
          currentPlayer = 1;
          this.assignPlayer(1, name);
          this.setTurn(1);
        } else if (numPlayers === 1) {
          currentPlayer = 2;
          this.assignPlayer(2, name);
          this.setTurn(1);
        } else if (numPlayers === 0) {
          currentPlayer = 1;
          this.assignPlayer(1, name);
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
        "ties": 0,
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
    } else if (numPlayer === 2) {
      player2 = new PlayerConsole(pName, 2);
      player2.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
      console.log("player2: " + JSON.stringify(player2));
    }
  },
  // ------------------------------------------------------------------------------------------
  // setTurn(turn) sets the turn number in the rps game database
  //
  setTurn(turn) {
    database.ref("turn/").set(turn);

    // remove turn from database on disconnect
    // database.ref("turn/").onDisconnect.remove();
  },
  // ------------------------------------------------------------------------------------------
  // turnHandler(nTurn) takes in the rps turn number (either 1, 2 or 3) and performs an
  //  active player/opponent routine based on that turn
  //
  turnHandler(activeTurn) {
    console.log("in turnHandler(): turn: " + activeTurn + " currentPlayer: " + JSON.stringify(currPlayerObj));

    console.log("turn value, currentPlayer, otherPlayer:  " + activeTurn, currentPlayer, otherPlayer);
    // messages on turn1;
    // if (currentPlayer === 1) {
    //  currPlayerObj = player1;
    //  otherPlayer = 2;
    //  otherPlayerObj = player2;
    // } else {
    //  currPlayerObj = player2;
    //  otherPlayer = 1;
    //  otherPlayerObj = player1;
    // }
    switch (activeTurn) {
      case 1:
        determineActivePlayerBasedOnTurn(1);
        currPlayerObj.outlineBox(1, "green");
        // empty both player's game consoles
        emptyConsole();
        this.activeTurnHeaderMessages(activeTurn);
        if (currentPlayer === 1) {
          currPlayerObj.showChoices();
        }
        break;
      case 2:
        determineActivePlayerBasedOnTurn(2);
        console.log("case " + activeTurn.toString() + ". In turnHandler(). currPlayerObj: " + JSON.stringify(currPlayerObj));
        console.log("case " + activeTurn.toString() + ". In turnHandler(). otherPlayerObj: " + JSON.stringify(otherPlayerObj));
        console.log("currentPlayer: " + currentPlayer);
        console.log("otherPlayer: " + otherPlayer);
        currPlayerObj.outlineBox(1, "darkgray");
        currPlayerObj.outlineBox(2, "green");

        this.activeTurnHeaderMessages(activeTurn);
        if (currentPlayer === 2) {
          currPlayerObj.showChoices();
        }
        break;
      default:
        break;
    }
  },
  // --------------------------------------------------------------------------------------------
  // setPlayerChoice() processes the rps choice selected by the player by updating the current
  // player's choice in the database. Note that in this function 'this' refers to the rock,
  // paper, scissor button that was pressed.
  //
  setPlayerChoice() {
    var pChoice = $(this).attr("data-name"),
        pNum = parseInt($(this).attr("player-num"), 10);

    currPlayerObj.setChoice(pChoice);

    // set current rpsGame turn to 2
    if (pNum === 1) {
      // currentPlayer = 2;
      // otherPlayer = 1;
      rpsGame.setTurn(2);
    }
  },
  // --------------------------------------------------------------------------------------------
  // activeTurnMessages(nTurn) takes in the current turn as a parameter and determines the
  //  player's console header messages to display
  //
  activeTurnHeaderMessages(nTurn) {
    console.log("in activeTurnMessages");
    if (nTurn === currentPlayer) {
      $("#player-state-message").text("It is your turn to choose.");
      // show choices to player
    } else if (nTurn === otherPlayer) {
      $("#player-state-message").text("Waiting for " + currPlayerObj.otherPlayerName() + " to choose.");
    } else {
      $("#player-state-message").html("");
    }
  }
};

// -----------------------------------------------------------------------------------------
// emptyConsole() empties out rps game console for both players
//
function emptyConsole() {
  console.log("in emptyConsole()");
  $("#choices1, #game-results, #choices-2").empty();
  console.log("end emptyConsole()");
}

// ------------------------------------------------------------------------------------------
// determineActivePlayerBasedOnTurn() sets the currPlayerObj to the active screen player
//
function determineActivePlayerBasedOnTurn(presentTurn) {
  switch (presentTurn) {
    case 1:
      if (currentPlayer === 1) {
        currPlayerObj = player1;
        otherPlayer = 2;
        otherPlayerObj = player2;
      } else {
        currPlayerObj = player2;
        otherPlayer = 1;
        otherPlayerObj = player1;
      }
      break;
    case 2:
      if (currentPlayer === 2) {
        currPlayerObj = player2;
        otherPlayer = 1;
        otherPlayerObj = player1;
      } else {
        currPlayerObj = player1;
        otherPlayer = 2;
        otherPlayerObj = player2;
      }
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------------------------------
// PlayerConsole() is a prototype to assist in dynamically changing a player's html elements.
//
function PlayerConsole(name, num) {

  this.name = name;
  this.playerNum = num;
  this.losses = 0;
  this.wins = 0;
  this.ties = 0;
  this.choices = [
                  {
                    "name": "Rock",
                    "image": "./assets/images/rock.png"
                  },
                  {
                    "name": "Paper",
                    "image": "./assets/images/paper.png"
                  },
                  {
                    "name": "Scissors",
                    "image": "./assets/images/scissors.png"
                  }
                ];

  // determine opponent 'num' by choosing 'other' number
  this.otherPlayer = this.playerNum === 1
                    ? 2
                    : 1;

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

  this.displayName = () => this.name;

  this.welcomeMsg = (msg) => {
    $("#player-welcome-message").html("<p class=\"text-center\">" + msg + "</p>");
  };
  this.playerEventMsg = (msg) => {
    $("#player-state-message").html(msg);
  };
  this.otherEventMsg = (msg) => {
    $("#player-state-message").html(msg);
  };
  this.hideNameBtn = () => {
    $("#player-form").hide();
  };
  this.showNameBtn = () => {
    $("#player-form").show();
  };
  this.outlineBox = (cnum, color) => {
    console.log("in this.outlineBox() this.playerNum: " + this.playerNum);
    $(".rps-card-" + cnum.toString()).css("outline", color + " solid 2px");
  };
  this.showChoices = () => {
    var currentChoice,
        cImg,
        listChoices = $("<div>");

    for (const choice of this.choices) {
      currentChoice = $("<button>");
      cImg = $("<img>");
      for (const key in choice) {
        if (key === "name") {
          currentChoice.attr("data-name", choice.name).
                        attr("player-num", this.playerNum).
                        addClass("rps-button mb-2").
                        html("<strong>" + choice.name + "</strong>");
          cImg.attr("alt", choice.name).
               attr("data-img", choice.name);
        } else if (key === "image") {
          cImg.attr("src", choice.image).
               addClass("img-fluid rps-img");
        }
      }
      currentChoice.append(cImg);
      listChoices.append(currentChoice);
    }
    $("#choice" + this.playerNum.toString()).append(listChoices);
  };
  this.setChoice = (ch) => {
    var cImg = $("<img>"),
        htmlText = "<p class=\"text-center\"><strong>You chose " + ch + ".</strong></p>",
        selectedImgObj = this.choices.find((rpsObj) => rpsObj.name === ch);

    database.ref("players/" + this.playerNum.toString()).update({"choice": ch});
    cImg.attr("alt", ch).
         attr("data-img", ch).
         attr("src", selectedImgObj.image).
         addClass("img-fluid rps-img-selected");
    $("#choice" + this.playerNum.toString()).empty().
                                             addClass("text-center").
                                             append(htmlText, cImg);
  };
}

  // Create a variable to reference the database
  database = firebase.database();

  // ------------------------------------------------------------------------------------------
  // "Add Player" listener
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
      scoreText = "Wins: " + childsv.wins + " Ties: " + childsv.ties + " Losses: " + childsv.losses;
      $("#score" + numPlayer.toString()).html(scoreText);
    },
    (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );

  // ------------------------------------------------------------------------------------------
  // "Turn" listener
  // When turn is set, determine which player's turn it is and wait for that players choice
  //
  database.ref("turn/").on(
    "value", (snapshot) => {
    var numberTurn = snapshot.val();

    console.log("player1: " + JSON.stringify(player1));
    console.log("player2: " + JSON.stringify(player2));
    console.log("turn: " + numberTurn);

    // call rpsGame.turnHandler
    rpsGame.turnHandler(numberTurn);
    // switch (numberTurn) {
    //  case 1:
    //    rpsGame.turnHandler(1);
    //    break;
    //  case 2:
    //    console.log("case turn 2");
    // rpsGame.turnHandler(2);
    //    break;
    //  case 3:
    //    console.log("case turn 3");
        // rpsGame.turnHander(3);
    //    break;
    //  default:
    //    console.log("Turn not understood.");
    //    break;
    // }
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

  // On player selected choice
  $(document).on("click", ".rps-button", rpsGame.setPlayerChoice);

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