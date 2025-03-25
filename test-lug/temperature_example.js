// Simulate an async user fetch with a random delay
async function fetchUser(userId) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 400) + 100; // 100-500ms
    setTimeout(() => {
      resolve({
        id: userId,
        name: `User ${userId}`,
        tempUnit: getRandomTempUnit()
      });
    }, delay);
  });
}

// Simulate an async temperature fetch with a random delay
// Returns temperature in Celsius
async function fetchTemperature(location) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 250) + 50; // 50-300ms
    setTimeout(() => {
      if (location === "LAX") {
        resolve(22); // example: 22°C in Los Angeles
      } else if (location === "NYC") {
        resolve(10); // example: 10°C in New York
      } else {
        resolve(25); // default temperature
      }
    }, delay);
  });
}

// Utility to pick a random temperature unit
function getRandomTempUnit() {
  const units = ["Celsius", "Fahrenheit", "Kelvin"];
  console.log(units);


  
  return units[Math.floor(Math.random() * units.length)];
}

/**
 * Converts a given Celsius temperature to the user's preferred unit.
 * Note that we receive the user object directly (already fetched).
 */
function displayTemperature(tempInCelsius, user) {
  switch (user.tempUnit) {
    case "Fahrenheit":
      return (tempInCelsius * 9) / 5 + 32;
    case "Kelvin":
      return tempInCelsius + 273.15;
    default:
      // If user prefers Celsius or an unknown unit, default to Celsius
      return tempInCelsius;
  }
}

async function getTempAndUser(userNum) {
  let LOCATION = "LAX";
  const usersTemps = [];
  for (let i = 1; i <= userNum; i++) {
    if (i % 2 == 0) {
        LOCATION = "TWN";
    }
    const user = await fetchUser(i);

    console.log(i);
    console.log(user);
    const tempInCelsius = fetchTemperature(LOCATION);
    usersTemps.push(displayTemperature(tempInCelsius, user));
  }
}
async function main() {
    const asyncs = []
    for (let i = 1; i < 10; i++) {
        asyncs.push(getTempAndUser(i));
    }
    await Promise.all(asyncs);

}
main();