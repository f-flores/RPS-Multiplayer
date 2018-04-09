# RPS-Multiplayer

Multi player version of rock paper scissors.

### Description

This is an implementation of a two player rock, paper, scissor game, using firebase. The game waits for two players to login in order to begin the rps game. Player 1 makes the first selection, while Player 2 is shown a 'wait message'.
When player1 has selected rock, paper or scissors, it is player2's turn to choose. Neither player can see the other's choice. The game then determines which player won, and updates each player's statistics. This version of the game also records draws.

### Approach

The rps game leverages firebase to store player information. 'Global' database listener functions are central components in controlling the gameflow. For example, each time a player signs up for the game, the "players/" `child_added` listener is triggered. Similarly, each time there is a 'turn' in the game, the `turnHandler()` function is called to handle game flow logic and manage each player's console display. 

I used a constructor function to represent player one's and player two's consoles. Helper functions within this constructor, like `playerEventMsg()`, `displayName()`, `otherPlayerName()`, `showChoices()`, and `setChoice()`, are used to dynamically change the player console based on who is the current player and what turn (1, 2 or 3) of the game it is.

The `rpsGame` object contains functions like `setupPlayer()`, `assignPlayer()`, `turnHandler()`, `setPlayerChoice()`, and `determineGameResult()` among others, to control game logic. It interfaces with both the `player` constructor and the firebase database.

Once a round of rps finishes, another one begins. A player can 'sign out' by reloading the page.

### File Structure

`index.html` contains the basic structure for each player's console. I leveraged bootstrap4's card features, among others, to display different elements of a player's game status.

A custom style sheet for this app is located in the `assets\css` folder. One javascript file, `multi-rps.js`, in the `assets\js` folder, contains the variables, functions, and object definitions used to implement rps.

The rock, paper and scissors images displayed upon a player's turn are in the `assets\images` directory.

### Comments

The Multi-RPS app was added to my github profile's portfolio:
[f-flores portfolio](https://f-flores.github.io/portfolio.html).