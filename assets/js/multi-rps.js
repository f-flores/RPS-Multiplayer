// --------------------------------------------------------------------------------------------
// File name: multi-rps.js
// Description: This is an implementation of a two player rock, paper, scissor game, using
//  firebase. The rps game leverages firebase to store player information. 'Global' database
//  listener functions are important components in controlling the gameflow. Each time a
//  player signs up for the game, the "players/" child_added listener is triggered. Similarly,
//  each time there is a 'turn' in the game, the turnHandler() function is called to handle
//  game flow logic. I used a constructor function to represent player one's and player two's
//  consoles.
// Date: April, 2018
// Author: Fabian Flores
//
// --------------------------------------------------------------------------------------------

const WaitForNewGame = 3000;
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
var player1, player2, currentPlayer, otherPlayer, currPlayerObj;
var database;

// a game object for rock, paper scissors game
var rpsGame = {
  // ------------------------------------------------------------------------------------------
  // setupPlayer() takes in numPlayer as a parameter and adds the numPlayer leaf to the
  // players branch
  //
  setupPlayer(name) {
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

    // setup html player greeting and name using PlayerConsole constructor
    if (numPlayer === 1) {
      player1 = new PlayerConsole(pName, 1);
      player1.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
    } else if (numPlayer === 2) {
      player2 = new PlayerConsole(pName, 2);
      player2.welcomeMsg("Hi, " + pName + "! You are player " + numPlayer + ".");
    }
  },
  // ------------------------------------------------------------------------------------------
  // setTurn(turn) sets the turn number in the rps game firebase database
  //
  setTurn(turn) {
    database.ref("turn/").set(turn);
  },
  // ------------------------------------------------------------------------------------------
  // turnHandler(nTurn) takes in the rps turn number (either 1, 2 or 3) and performs an
  //  active player/opponent routine based on that turn
  //
  turnHandler(activeTurn) {
    switch (activeTurn) {
      case 1:
        // empty both player's game consoles
        emptyConsole();
        determineActivePlayerBasedOnTurn(1);
        currPlayerObj.outlineBox(1, "green");
        this.activeTurnHeaderMessages(activeTurn);
        if (currentPlayer === 1) {
          currPlayerObj.showChoices();
        }
        break;
      case 2:
        determineActivePlayerBasedOnTurn(2);
        currPlayerObj.outlineBox(1, "darkgray");
        currPlayerObj.outlineBox(2, "green");
        this.activeTurnHeaderMessages(activeTurn);
        if (currentPlayer === 2) {
          currPlayerObj.showChoices();
        }
        break;
      case 3:
        this.activeTurnHeaderMessages(activeTurn);
        $(".rps-card").css("outline", "red solid 4px");
        this.determineGameResult();
        break;
      default:
        console.log("Turn does not exist.");
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

    // set current rpsGame turn
    if (pNum === 1) {
      rpsGame.setTurn(2);
    } else if (pNum === 2) {
      rpsGame.setTurn(3);
    }
  },
  // --------------------------------------------------------------------------------------------
  // activeTurnMessages(nTurn) takes in the current turn as a parameter and determines the
  //  player's console header messages to display
  //
  activeTurnHeaderMessages(nTurn) {
    console.log("in activeTurnMessages");
    if (nTurn === currentPlayer) {
      currPlayerObj.playerEventMsg("It is your turn to choose, " + currPlayerObj.displayName());
      // show choices to player
    } else if (nTurn === otherPlayer) {
      currPlayerObj.otherEventMsg("Waiting for " + currPlayerObj.otherPlayerName() + " to choose.");
    } else {
      $("#player-state-message").html("<p class=\"text-center\">The winner is...</p>");
    }
  },
  // --------------------------------------------------------------------------------------------
  // determineGameResult(nTurn) reads the values of each player's choice and, runs through game
  // logic to determine result
  //
  determineGameResult() {
    var rpsPlayer1, rpsPlayer2;

    database.ref("players/").on(
      "value", (snapshot) => {
        var sv = snapshot.val(),
            scoreText = "",
            winner = "",
            result = "";

        rpsPlayer1 = sv["1"];
        rpsPlayer2 = sv["2"];

        // rock paper scissors game logic
        switch (rpsPlayer1.choice) {
          case "Rock":
            switch (rpsPlayer2.choice) {
              case "Rock":
                result = "tie";
                break;
              case "Paper":
                result = "2";
                break;
              case "Scissors":
                result = "1";
                break;
              default:
                break;
            }
            break;
          case "Paper":
            switch (rpsPlayer2.choice) {
              case "Rock":
                result = "1";
                break;
              case "Paper":
                result = "tie";
                break;
              case "Scissors":
                result = "2";
                break;
              default:
                break;
            }
            break;
          case "Scissors":
            switch (rpsPlayer2.choice) {
              case "Rock":
                result = "2";
                break;
              case "Paper":
                result = "1";
                break;
              case "Scissors":
                result = "tie";
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
        switch (result) {
          case "1":
            $("#game-title").html(rpsPlayer1.playerName + " wins!");
            $("#game-results").html(rpsPlayer1.choice + " beats " + rpsPlayer2.choice + ".");
            rpsPlayer1.wins++;
            rpsPlayer2.losses++;
            break;
          case "2":
            $("#game-title").html(rpsPlayer2.playerName + " wins!");
            $("#game-results").html(rpsPlayer2.choice + " beats " + rpsPlayer1.choice + ".");
            rpsPlayer1.losses++;
            rpsPlayer2.wins++;
            break;
          case "tie":
            $("#game-title").html("Draw!");
            $("#game-results").html("You both selected " + rpsPlayer1.choice + ".");
            rpsPlayer1.ties++;
            rpsPlayer2.ties++;
            break;
          default:
            break;
        }
      },
      (errorObject) => {
        console.log("Errors handled: " + JSON.stringify(errorObject));
      }
    );
    // update players "1" and "2" branch in firebase with wins, losses and ties stats
    this.updatePlayerStats("1", rpsPlayer1);
    this.updatePlayerStats("2", rpsPlayer2);
    setTimeout(() => {
      // restart rps game by setting turn to 1, and clearing game results
      this.setTurn(1);
      $(".rps-card, .rps-card-2").css("outline", "none");
      $("#game-title").html("");
      $("#game-results").html("");
    }, WaitForNewGame);
  },
  // ---------------------------------------------------------------------------------------
  // updatePlayerStats() updates stats for players in firebase database and on screen
  //
  updatePlayerStats(pNum, playerObj) {
    var scoreText = "";

    database.ref("players/" + pNum.toString()).update(
      {
        "wins": playerObj.wins,
        "losses": playerObj.losses,
        "ties": playerObj.ties
      },
      (errorObject) => {
        console.log("Errors handled: " + JSON.stringify(errorObject));
      }
    );
    scoreText = "Wins: " + playerObj.wins + " Draws: " + playerObj.ties + " Losses: " + playerObj.losses;
    $("#score" + pNum.toString()).html(scoreText);
  }
};

var rpsChat = {
  "msg": "",
  sendMessage() {
    var msgObj = {};

    console.log("in sendMessage()");
    msgObj.name = currPlayerObj.displayName();
    msgObj.message = this.msg;
    database.ref("chat/").push(msgObj);
  }
};

// -----------------------------------------------------------------------------------------
// emptyConsole() empties out rps game console for both players
//
function emptyConsole() {
  $("#choice1, #game-results, #choice2").empty();
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
      } else {
        currPlayerObj = player2;
        otherPlayer = 1;
      }
      break;
    case 2:
      if (currentPlayer === 2) {
        currPlayerObj = player2;
        otherPlayer = 1;
      } else {
        currPlayerObj = player1;
        otherPlayer = 2;
      }
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------------------------------
// PlayerConsole() is a constructor to assist in dynamically changing a player's "console"
// elements, like 'state-message' or list of rps choices.
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
    $("#player-state-message").html("<p class=\"text-center\">" + msg + "</p>");
  };
  this.otherEventMsg = (msg) => {
    $("#player-state-message").html("<p class=\"text-center\">" + msg + "</p>");
  };
  this.hideNameBtn = () => {
    $("#player-form").hide();
  };
  this.showNameBtn = () => {
    $("#player-form").show();
  };
  this.outlineBox = (cnum, color) => {
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
  // "Add Player" global listener
  // When a player is added to the game, display that player's initial information:
  // Name, Number of wins (0), Number of ties (0), Number of losses (0)
  //
  database.ref("players/").on(
    "child_added", (childSnapshot) => {
      var childsv = childSnapshot.val(),
          numPlayer = childSnapshot.key,
          scoreText = "";

      $("#player" + numPlayer.toString()).html(childsv.playerName);
      scoreText = "Wins: " + childsv.wins + " Draws: " + childsv.ties + " Losses: " + childsv.losses;
      $("#score" + numPlayer.toString()).html(scoreText);
    },
    (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );

  // ------------------------------------------------------------------------------------------
  // "Turn" global listener
  // When turn is set, determine which player's turn it is and wait for that players choice
  //
  database.ref("turn/").on(
    "value", (snapshot) => {
    var numberTurn = snapshot.val();

    // call rpsGame.turnHandler
    rpsGame.turnHandler(numberTurn);
  },
    (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
    }
  );

  // When player makes rps choice, setPlayerChoice is called
  $(document).on("click", ".rps-button", rpsGame.setPlayerChoice);

  // remove turn on disconnect
  database.ref("turn/").onDisconnect().
                        remove();

  // RPS Game begins when the 'Start' button is pressed
  $("#start-btn").on("click", (event) => {
    var playerName = $("#player-name").val().
                                       trim();

    console.log("in #start-btn");
    event.preventDefault();
    if (playerName !== "") {
      rpsGame.setupPlayer(playerName);
      $("#player-name").val("");
    }
  });

  // send chat button handler
  $("#send-chat-btn").on("click", (event) => {
    var chatMessage = $("#send-chat").val();

    event.preventDefault();
    // Get message then clear it
    if (chatMessage !== "") {
      rpsChat.msg = chatMessage;
      $("#send-chat").val("");
    }

    if (currPlayerObj.displayName() !== "") {
      rpsChat.sendMessage();
    }

  });

  // End of document.ready(function)
});