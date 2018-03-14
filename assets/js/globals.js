

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

$(document).ready(() => {
  // Capture Button Click
  $("#start-btn").on("click", (event) => {
    var player1Name;

    console.log("in #start-btn");

    event.preventDefault();

    player1Name = $("#player-name").val().
                                    trim();
    console.log("player1Name: " + player1Name);

    // Code for handling the push
    database.ref().push({
      "playerName": player1Name,
      "dateAdded": firebase.database.ServerValue.TIMESTAMP
    });

  });

});