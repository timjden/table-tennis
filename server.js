const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, "data.sqlite");
const db = new sqlite3.Database(dbPath);

// Create database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);

  db.run(
    `INSERT INTO players (name) VALUES ('John'), ('Emily'), ('Michael'), ('Sarah')`
  );

  db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_one_name VARCHAR,
    player_two_name VARCHAR,
    player_one_score INTEGER,
    player_two_score INTEGER,
    winner VARCHAR,
    draw BOOLEAN,
    FOREIGN KEY (player_one_name) REFERENCES players (name),
    FOREIGN KEY (player_two_name) REFERENCES players (name)
  )`);
});

// Serve website files in the 'public' directory
app.use(express.static("public"));

// Endpoint that calculates the leaderboard
app.get("/leaderboard", (req, res) => {
  db.all(
    `SELECT winner, COUNT(*) AS wins FROM games
    GROUP BY winner
    ORDER BY COUNT(*) DESC`,
    (err, rows) => {
      console.log(rows);
      res.json(rows);
    }
  );
});

// Endpoint that gets names from the database
app.get("/players", (req, res) => {
  db.all(`SELECT name FROM players`, (err, rows) => {
    const names = rows.map((row) => row.name);
    console.log(names);
    res.json(names);
  });
});

function calculateWinner(bodyData) {
  if (bodyData.playerOneScore > bodyData.playerTwoScore) {
    return bodyData.playerOneName;
  } else if (bodyData.playerTwoScore > bodyData.playerOneScore) {
    return bodyData.playerTwoName;
  } else {
    return null;
  }
}

// Endpoint that inserts data into the database
app.post("/submit", (req, res) => {
  console.log(req.body);
  const winner = calculateWinner(req.body);
  let draw = false;
  if (winner === null) {
    draw = true;
  }

  db.run(
    `INSERT INTO games (player_one_name, player_two_name, player_one_score, player_two_score, winner, draw) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.body.playerOneName,
      req.body.playerTwoName,
      req.body.playerOneScore,
      req.body.playerTwoScore,
      winner,
      draw,
    ],
    (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
