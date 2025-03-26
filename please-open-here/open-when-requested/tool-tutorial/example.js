
const axios = require('axios');

const baseURL = 'http://localhost:3000'; // Adjust if your server runs elsewhere

async function invokeAPIs(id) {
  try {
    const playerId = `player00${id}`;

    const orderResponse = await axios.post(`${baseURL}/order`, {
      player: playerId,
      orderId: 20,
      dishes: ['burger', 'salad']
    });
    console.log('Order Response:', orderResponse.data);

    const profileResponse = await axios.get(`${baseURL}/player/${playerId}`);
    console.log('Player Profile:', profileResponse.data);

  } catch (error) {
    console.error('Error during API calls:', error.message);
  }
}

async function main() {
    await Promise.all([invokeAPIs(1), invokeAPIs(2), invokeAPIs(3)]);
}

main();