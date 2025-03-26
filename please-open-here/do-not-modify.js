const axios = require('axios');

const SERVER_URL = 'http://localhost:3000/order';
const PLAYER_API_URL = 'http://localhost:3000/player';
const TOTAL_ORDERS = 10; // Change this as needed

function getDishesFor(index) {
    if ((index + 1) % 3 === 0) {
        return ['burger', 'salad']; 
    } else if ((index + 1) % 2 === 0) {
        return ['burger'];
    } else {
        return ['salad']; 
    }
}

async function sendOrder(orderIndex) {
    const playerId = `Player${500-orderIndex}`;
    const dishes = getDishesFor(orderIndex);

    console.log(`📝 Submitting Order #${orderIndex + 1}: ${playerId} orders ${dishes.join(', ')}`);

    try {
        await axios.post(SERVER_URL, {
            player: playerId,
            dishes: dishes
        })
    } catch (error) {
        console.error(`❌ Failed to handle order for ${playerId}:`, error.response?.data || error.message);
    }
}

async function sendAllOrders() {
    const promises = [];

    for (let i = 0; i < TOTAL_ORDERS; i++) {
        promises.push(sendOrder(i));
    }

    await Promise.all(promises);
}

sendAllOrders();