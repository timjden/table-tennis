// Calculate leaderboard
async function calculateLeaderboard() {
  const table = document.querySelector("#leaderboardTable");
  table.innerHTML = "";
  fetch("/leaderboard", {
    method: "GET",
  })
    .then((response) => {
      responseList = response.json();
      return responseList;
    })
    .then((leaderboardRows) => {
      const leaderboardTable = document.querySelector("#leaderboardTable");
      const headerRow = document.createElement("tr");
      const newCol1 = document.createElement("td");
      newCol1.textContent = "Name";
      headerRow.appendChild(newCol1);
      const newCol2 = document.createElement("td");
      newCol2.textContent = "Number of Wins";
      headerRow.appendChild(newCol2);
      leaderboardTable.appendChild(headerRow);
      console.log(leaderboardTable);

      leaderboardRows.forEach((row) => {
        const newRow = document.createElement("tr");
        const newName = document.createElement("td");
        const newWins = document.createElement("td");
        newName.textContent = row.winner;
        newRow.appendChild(newName);
        newWins.textContent = row.wins;
        newRow.appendChild(newWins);
        leaderboardTable.appendChild(newRow);
        console.log(row);
      });
    });
}

calculateLeaderboard();

// GET player names from the database
fetch("/players", { method: "GET" })
  .then((response) => {
    responseList = response.json();
    return responseList;
  })
  .then((players) => {
    const selectElements = document.querySelectorAll(".playerNames");
    selectElements.forEach((element) => {
      players.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        element.appendChild(option);
      });
    });
  });

// Submit button functionality
document.getElementById("myForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission

  calculateLeaderboard();

  // Get form data
  const playerOneName = document.getElementById("playerOneName").value;
  const playerTwoName = document.getElementById("playerTwoName").value;
  const playerOneScore = parseInt(
    document.getElementById("playerOneScore").value
  );
  const playerTwoScore = parseInt(
    document.getElementById("playerTwoScore").value
  );

  // Create an object to send as JSON
  const formData = {
    playerOneName,
    playerTwoName,
    playerOneScore,
    playerTwoScore,
  };

  // Send form data to the server
  fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
});
