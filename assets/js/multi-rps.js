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
    rpsGame.isPlayer1selected = rpsGame.isPlayer1selected();
    rpsGame.isPlayer2selected = rpsGame.isPlayer2selected();
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
      rpsGame.player1selected = true;

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
      player2 = new PlayerConsole(playerName, "2");
      dbPath = "/players/2";
      // $("#player1").text(playerName);
      player2.displayName();

      player2.hideNameBtn();
      player2.welcomeMsg("Hi " + playerName + ", you are player " + player2.playerNum);
      rpsGame.player2selected = true;


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

  // Capture Button Click
  initGame();

  $("#start-btn").on("click", (event) => {
    var playerName;

    console.log("in #start-btn");
    event.preventDefault();

    playerName = $("#player-name").val().
                                    trim();
    console.log("playerName: " + playerName);
    rpsGame.isPlayer1selected = rpsGame.isPlayer1selected();
    rpsGame.isPlayer2selected = rpsGame.isPlayer2selected();
    console.log("isPlayer1selected() in #start-btn: " + rpsGame.isPlayer1selected());

    if (rpsGame.areBothPlayersSelected()) {
      console.log("Game can start.");
    } else if (!rpsGame.isPlayer1selected()) {
        firebase.auth().signInAnonymously().
                then((user) => {
                user.updateProfile({"displayName": playerName});
        });
        // setup player1screen
        setupPlayer1(playerName);
    } else if (rpsGame.isPlayer1selected() && !rpsGame.isPlayer2selected()) {
       //  firebase.auth().signInAnonymously().
       //   then((user) => {
       //   user.updateProfile({"displayName": playerName});
       // });

        // setup player2screen
        setupPlayer2(playerName);
    }


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