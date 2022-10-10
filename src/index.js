const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const details = require("./data/data.json");
const users = [];
const initialGuesses = 5;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

app.use(express.static("public"));
app.use(express.json());

/**
 * It takes a country name (string), and returns an array of the same length,
 *  where each element is either a dash or an underscore,
 * depending on whether the corresponding character in the string is a space or not.
 * @param country - "United States of America"
 */
function getCountryUnsolved(country) {
  const countryUnsolved = [];
  for (let i = 0; i < country.length; i++) {
    if (country[i] === " ") {
      countryUnsolved.push("-");
    } else {
      countryUnsolved.push("_");
    }
  }
  return countryUnsolved;
}

app.post(`/start`, (request, response) => {
  const newUser = request.body.username;

  if (users.find((user) => user.name === newUser)) {
    console.log("User already exists");
    response.json({
      status: "error",
      data: "User already exists",
    });
    return;
  }

  const country = details[Math.floor(Math.random() * details.length)];
  const countryUnsolved = getCountryUnsolved(country);

  users.push({
    name: newUser,
    guesses: initialGuesses,
    country: country,
    userGuess: countryUnsolved,
  });

  console.log(`Created game for a new user (${newUser})`);

  response.json({
    status: "success",
    data: { country: countryUnsolved, guesses: initialGuesses },
  });
  console.log(`Sent country and guesses to "${newUser}"`);
});

app.post(`/guess`, (request, response) => {
  // name of the user
  const currentUser = request.body.username;
  // letter guessed by the user
  const letter = request.body.guess;
  // find the user in the array
  const user = users.find((user) => user.name === currentUser);

  // if the user doesn't exist, return an error
  if (!user) {
    response.json({
      status: "error",
      data: "User doesn't exist",
    });
    return;
  }

  // assign the data of the user to variables
  const country = user.country;
  const countryUnsolved = user.userGuess;

  // replace the underscores with the letter guessed
  for (let i = 0; i < country.length; i++) {
    if (country[i].toUpperCase() === letter.toUpperCase()) {
      countryUnsolved[i] = country[i];
    }
  }

  // if the letter guessed is not in the country name, reduce the number of guesses
  if (!country.toUpperCase().includes(letter.toUpperCase())) {
    user.guesses--;
  }

  // if the user has no more guesses, return an error
  if (user.guesses === 0) {
    // remove the user from the array
    users.splice(users.indexOf(user), 1);

    response.json({
      status: "game-over",
      data: "You Lost",
    });
    console.log(`User "${currentUser}" lost`);
    return;
  }

  // if the user has guessed all the letters, return a success message
  if (!countryUnsolved.includes("_")) {
    // remove the user from the array
    users.splice(users.indexOf(user), 1);

    response.json({
      status: "game-over",
      data: "You Won",
    });
    console.log(`User "${currentUser}" won`);
    return;
  }

  // return the updated data to the user
  response.json({
    status: "success",
    data: { country: countryUnsolved, guesses: user.guesses },
  });
});

/* after 6hours reset the users array */
setInterval(() => {
  users.splice(0, users.length);
}, 21600000);
