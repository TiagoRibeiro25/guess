let username;
const btnAudio = new Audio("../audio/button.mp3");

function updateButtons(status) {
  buttons.forEach((button) => {
    button.disabled = status;
    button.style.visibility = "visible";
  });
}

function resetGame() {
  username = null;
  updateButtons(true);
  document.querySelector("#submit").disabled = false;
  document.querySelector("#username").innerText = "";
  document.querySelector("#guesses").innerText = "";
  document.querySelector("#country").innerText = "";
  document.querySelector("#result").style.display = "none";
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  btnAudio.play();

  // get the username from the DOM
  username = document.querySelector("#name").value;

  // send a POST request to the server
  const response = await fetch("/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  // get the response from the server
  const data = await response.json();

  console.log(data);

  // if the response is an error, show the error message
  if (data.status === "error") {
    alert("User already exists");
    return;
  }

  // if the response is a success, update the DOM

  // enable all buttons
  updateButtons(false);

  // disable the submit button
  document.querySelector("#submit").disabled = true;

  // show the username
  document.querySelector(
    "#username"
  ).innerHTML = `Name: <span class="username">${username}</span>`;

  // show the user guesses left
  document.querySelector(
    "#guesses"
  ).innerHTML = `Guesses Left: <span class="guesses">${data.data.guesses}</span>`;

  // show the country to guess (with dashes)
  document.querySelector("#country").innerHTML =
    data.data.country.join(" ");
});

const buttons = document.querySelectorAll(".key");
buttons.forEach((button) => {
  const letter = button.innerText;

  button.addEventListener("click", async () => {
    btnAudio.play();

    const response = await fetch("/guess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, guess: letter }),
    });

    const data = await response.json();

    console.log(data);

    // hide the button
    button.style.visibility = "hidden";

    if (data.status === "game-over" || data.status === "error") {
      if (data.data == "You Won") {
        // show the full country name
        document.querySelector("#country").innerText = document
          .querySelector("#country")
          .innerText.replace("_", letter);
      }

      // show the result + a button to play again
      document.querySelector("#result-msg").innerText = data.data;
      document.querySelector("#result").style.display = "block";
      updateButtons(true);
      return;
    }

    document.querySelector(
      "#guesses"
    ).innerHTML = `Guesses Left: <span class="guesses">${data.data.guesses}</span>`;

    document.querySelector("#country").innerText =
      data.data.country.join(" ");
  });
});

updateButtons(true);

document.querySelector("#play-again").addEventListener("click", () => {
  btnAudio.play();
  resetGame();
});
