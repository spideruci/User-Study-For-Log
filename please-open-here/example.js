
const axios = require('axios');

const baseURL = 'http://localhost:3000'; // Adjust if your server runs elsewhere

async function invokeAPIs() {
  try {
    const playerId = 'player001';

    const orderResponse = await axios.post(`${baseURL}/order`, {
      player: playerId,
      orderId: 20,
      dishes: ['burger', 'salad']
    });
    console.log('Order Response:', orderResponse.data);


  } catch (error) {
    console.error('Error during API calls:', error.message);
  }
}

invokeAPIs();
