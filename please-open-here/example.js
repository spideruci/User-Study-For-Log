
const axios = require('axios');

const baseURL = 'http://localhost:3000'; // Adjust if your server runs elsewhere

async function invokeAPIs() {
  try {
    const playerId = 'player001';

    // 1. Call POST /order
    const orderResponse = await axios.post(`${baseURL}/order`, {
      player: playerId,
      orderId: 20,
      dishes: ['burger', 'salad']
    });
    console.log('Order Response:', orderResponse.data);

    // 2. Call GET /player/:id
    const profileResponse = await axios.get(`${baseURL}/player/${playerId}`);
    console.log('Player Profile:', profileResponse.data);

  } catch (error) {
    console.error('Error during API calls:', error.message);
  }
}

invokeAPIs();
