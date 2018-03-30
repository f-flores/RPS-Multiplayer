// --------------------------------------------------------------------------------------------
// File name: multi-rps.js
// Description: Contains rps variables.
//
// --------------------------------------------------------------------------------------------

/* global database:true */
/* global rpsGame:true */
/* global firebase:true */
/* global PlayerConsole:true */

var player1, player2;

$(document).ready(() => {
  // -----------------------------------------------------------------------------------------
  // initializes rpsGame
  function initGame() {
    console.log("in initGame()");
 // database.ref().push({
 // "players": "",
 // "dateAdded": firebase.database.ServerValue.TIMESTAMP
 // });
  }

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

  // -----------------------------------------------------------------------------------------
  // setupPlayer1Screen() displays player1 console
  //
    function setupPlayer1Screen() {
      console.log("Player 1 screen");
    }

  // -----------------------------------------------------------------------------------------
  // setupPlayer2Screen() displays player1 console
  //
    function setupPlayer2Screen() {
      console.log("Player 2 screen");
    }

  // Capture Button Click
  initGame();

  $("#start-btn").on("click", (event) => {
    var playerName,
        dbPath,
        losses = 0,
        wins = 0;

    console.log("in #start-btn");

    event.preventDefault();

    playerName = $("#player-name").val().
                                    trim();
    console.log("playerName: " + playerName);

    firebase.auth().signInAnonymously();
    // .
      // then((user) => {
        // user.updateProfile({"displayName": playerName});
      // });

    if (rpsGame.areBothPlayersSelected()) {
      console.log("Game can start.");
    } else if (!rpsGame.isPlayer1selected()) {
        player1 = new PlayerConsole(playerName, "1");
        dbPath = "/players/1";
        // $("#player1").text(playerName);
        player1.displayName();
        player1.hideNameBtn();
        player1.welcomeMsg("Hi " + playerName + ", you are player " + player1.playerNum);
        rpsGame.player1selected = true;
        // setup player1screen
        setupPlayer1Screen();
    } else if (rpsGame.isPlayer1selected() && !rpsGame.isPlayer2selected()) {
        player2 = new PlayerConsole(playerName, "2");
        dbPath = "/players/2";
        // player2.displayName();
        // player2.hideNameBtn();
        rpsGame.player2selected = true;
        // setup player2screen
        // setupPlayer2Screen();
    }

    // setup layer information
    database.ref(dbPath).update(
      {
        "choice": "",
        losses,
        playerName,
        wins
      },
      (errorObject) => {
        console.log("Errors handled: " + JSON.stringify(errorObject));
      }
    );

    $("#player-name").val("");

    // disable start button if both players are selected
    // if (rpsGame.areBothPlayersSelected()) {
    //  $("#player-form").hide();
    // } else {
    //  $("#player-form").show();
    // }
  });

  firebase.auth().onAuthStateChanged((firebaseUser) => {
    console.log(firebaseUser);
    if (firebaseUser) {
      $("#btn-logout-player1").removeClass("d-none");
      // chat.onlogin()
      // game.onlogin()
    } else {
      // user signed out
      $("#btn-logout-player1").addClass("d-none");
      // window.location.reload();
    }
  });

  // End of document.ready(function)
});


    // Code for handling the push
    // database.ref().push({
    //  "playerName": player1Name,
    //  "dateAdded": firebase.database.ServerValue.TIMESTAMP
    // });