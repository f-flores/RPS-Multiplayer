// --------------------------------------------------------------------------------------------
// File name: multi-rps.js
// Description: Contains rps variables.
//
// --------------------------------------------------------------------------------------------

/* global database:true */
/* global GAMESTATE:true */
/* global rpsGame:true */
/* global firebase:true */
/* global PlayerConsole:true */
/* global getGameState:true */
/* global setGameState:true */

var player1, player2;

$(document).ready(() => {
  // -----------------------------------------------------------------------------------------
  // initializes rpsGame
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
      player2.showOpponentName();

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
    console.log("playerName: " + playerName);
    // rpsGame.player1selected = rpsGame.isPlayer1loggedin();
    // rpsGame.player2selected = rpsGame.isPlayer2loggedin();
    console.log("isPlayer1loggedin() in #start-btn: " + rpsGame.isPlayer1loggedin());
    console.log("in #start-btn getGameState call");
    getGameState();
    if (rpsGame.areBothPlayersLoggedin()) {
      console.log("Game can start.");
    } else if (!rpsGame.isPlayer1loggedin()) {

        setupPlayer1(playerName);
        setGameState("created");
    } else if (rpsGame.isPlayer1loggedin() && !rpsGame.isPlayer2loggedin()) {

        setupPlayer2(playerName);
    }

    $("#player-name").val("");
    // End of "#start-btn"
  });


  // Main Game Loop
  initGame();
  console.log("current game state: " + getGameState());

  // wait for game to start
  if (GAMESTATE !== "fulfilled") {
    database.ref("players/").on("child_added", (childSnapshot) => {
      var childsv;

      childsv = childSnapshot.val();
      // refChild = childSnapshot.key;
      // do stuff with snapshot
      console.log("getGameState childSnapshot: " + JSON.stringify(childSnapshot));
      console.log("getGameState ref: " + childSnapshot.ref.key);
      console.log("getGameState parent of ref: " + childSnapshot.ref.parent.key);
      if (childSnapshot.ref.key === "1") {
        GAMESTATE = "created";
      } else if (childSnapshot.ref.key === "2") {
        GAMESTATE = "fulfilled";
        // set turn = 0
      }
      childsv.gameState = GAMESTATE;
    });
  }

  if (GAMESTATE === "fulfilled") {
    console.log("GAME CONDITIONS ARE FULFILLED.");
    console.log("RPS GAME CAN START");
  } else if (GAMESTATE === "created") {
    // create player
    player2 = new PlayerConsole("Waiting for player2...", "2");
    player2.showOpponentName();
    // show opponents name on active player's screen
    console.log("GAME CREATED BUT CANNOT START YET");
  } else {
    console.log("GAME CANNOT START YET");
  }

  // End of document.ready(function)
});

// ----------------------------------------------------------------------------------------------------
// --------------------- SUPERFLUOUS CODE -------------------------------------------------------------

    //    firebase.auth().signInAnonymously().
    //            then((user) => {
    //            user.updateProfile({"displayName": playerName});
    //    });
    // setup player1screen

    // disable start button if both players are selected
    // if (rpsGame.areBothPlayersLoggedin()) {
    //  $("#player-form").hide();
    // } else {
    //  $("#player-form").show();
    // }

           //  firebase.auth().signInAnonymously().
       //   then((user) => {
       //   user.updateProfile({"displayName": playerName});
       // });

        // setup player2screen

          // firebase.auth().onAuthStateChanged((firebaseUser) => {
    // console.log(firebaseUser);
    // if (firebaseUser) {
    //  $("#btn-logout-player1").removeClass("d-none");
      // chat.onlogin()
      // game.onlogin()
    // } else {
      // user signed out
      // $("#btn-logout-player1").addClass("d-none");
      // window.location.reload();
    // }
  // });

    // -----------------------------------------------------------------------------------------
  // initPlayer1Screen() initializes player1 console
  //
  // function initPlayer1Screen() {
  //    initialize Player 1 screen
  // }

  // -----------------------------------------------------------------------------------------
  // function initPlayer2Screen() displays player2 console
  //
  // function initPlayer2Screen() {
  //    initialize Player 2 screen
  // }

  // ----------------------------------------------------------------------------------------------------