// --------------------------------------------------------------------------------------------
// File name: multi-rps.js
// Description: Contains rps variables.
//
// --------------------------------------------------------------------------------------------

/* global database:true */
/* global rpsGame:true */

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
  // function setupPlayer1Screen() {
  //    console log Player 1 screen
  // }

  // -----------------------------------------------------------------------------------------
  // setupPlayer2Screen() displays player1 console
  //
  // function setupPlayer2Screen() {
  //    console log Player 2 screen
  // }

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

    if (rpsGame.areBothPlayersSelected()) {
      console.log("Game can start.");
    } else if (!rpsGame.isPlayer1selected()) {
        dbPath = "/players/1";
        $("#player1").text(playerName);
        rpsGame.player1selected = true;
        // setup player1screen
    } else if (!rpsGame.isPlayer2selected()) {
        dbPath = "/players/2";
        $("#player2").text(playerName);
        rpsGame.player2selected = true;
        // setup player2screen
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
    if (rpsGame.areBothPlayersSelected()) {
      $("#player-form").hide();
    } else {
      $("#player-form").show();
    }
  });

  // End of document.ready(function)
});


    // Code for handling the push
    // database.ref().push({
    //  "playerName": player1Name,
    //  "dateAdded": firebase.database.ServerValue.TIMESTAMP
    // });