const axios = require('axios');

const SERVER_URL = 'http://localhost:3000/order';
const PLAYER_API_URL = 'http://localhost:3000/player';
const TOTAL_ORDERS = 20; // Change this as needed

// Deterministically assign dishes based on order index
function getDishesFor(index) {
    if ((index + 1) % 3 === 0) {
        return ['burger', 'salad']; // every 3rd order gets both
    } else if ((index + 1) % 2 === 0) {
        return ['burger']; // even index gets burger
    } else {
        return ['salad']; // odd index gets salad
    }
}

async function sendOrder(orderIndex) {
    const playerId = `Player${500-orderIndex}`;
    const dishes = getDishesFor(orderIndex);

    console.log(`📝 Submitting Order #${orderIndex + 1}: ${playerId} orders ${dishes.join(', ')}`);

    try {
        const [playerRes, orderRes] = await Promise.all([
            axios.get(`${PLAYER_API_URL}/${playerId}`),
            axios.post(SERVER_URL, {
                player: playerId,
                dishes: dishes
            })
        ]);

        console.log(`👤 Player Info for ${playerId}:`, playerRes.data);
        console.log(`✅ Order placed successfully: Order ID = ${orderRes.data.orderId}`);
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