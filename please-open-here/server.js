// Fake Overcooked-style server with simulated latency and order processing
const express = require('express');
const { getPickleCountFor, sleep } = require('./please-do-not-open/utils');

const app = express();
const port = 3000;

app.use(express.json());

let orderCounter = 0;
const orders = {};

// === API Routes ===

app.post('/order', async (req, res) => {
    const { player, dishes } = req.body;

    if (!player || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: "Please provide player number and at least one dish" });
    }

    const orderId = generateOrderId();
    orders[orderId] = { player, dishes, status: 'preparing' };

    console.log(`[ORDER ${orderId}] New Order (from Player ${player}): ${dishes.join(', ')}`);

    try {
        await prepareOrder(orderId, player, dishes);
        orders[orderId].status = 'ready';
    } catch (err) {
        orders[orderId].status = 'failed';
        console.error(`[ORDER ${orderId}] Processing failed:`, err.message);
    }

    res.json({ message: "Order placed!", orderId });
});

app.get('/player/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Missing player ID" });
    }

    const profile = await getPlayerProfile(id);
    res.json(profile);
});

// === Start Server ===

app.listen(port, () => {
    console.log(`🍳 Overcooked Kitchen running at http://localhost:${port}`);
});


// === Utility Functions ===

// Generate a strictly incrementing order ID like "001", "002", etc.
function generateOrderId() {
    orderCounter += 1;
    return orderCounter.toString().padStart(3, '0');
}

// Generate a seeded random number based on a numeric seed
function seededRandom(seed) {
    const x = Math.sin(seed).toString().split('.')[1];
    return parseFloat('0.' + x);
}

async function getLevel(seed) {
    const level = Math.floor(seededRandom(seed + 200) * 50) + 1;
    await sleep(Math.random() * 200);
    return level;
}

// === Player Profile ===
async function getPlayerProfile(playerId) {
    const seed = parseInt(playerId.replace(/\D/g, '')) || 1;

    const avatars = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🎤', '🧙‍♂️', '🧛‍♀️', '🧟‍♂️', '🧞‍♂️', '🧚‍♀️', '🧜‍♂️'];
    const names = ['Alex', 'Jamie', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Cameron', 'Charlie'];

    const name = names[Math.floor(seededRandom(seed) * names.length)];
    const avatar = avatars[Math.floor(seededRandom(seed + 100) * avatars.length)];
    const level = await getLevel(seed);
    const ordersCompleted = Math.floor(seededRandom(seed + 300) * 100);

    console.log(`Get Player ${playerId} ${avatar}`);
    await sleep(Math.random() * 40);
    if (level > 47) console.log(`Level > 47`);
    await sleep(Math.random() * 40);
    console.log(`with name ${name} and level ${level}`);

    return {
        id: playerId,
        name,
        avatar,
        level,
        ordersCompleted
    };
}

// === Order & Dish Preparation ===

async function prepareOrder(orderId, player, dishes) {
    console.log(`Player ${player} started Order ${orderId} with ${dishes.join(" and ")}`);
    await Promise.all(dishes.map(dish => prepareDish(dish, orderId)));
    console.log(`[ORDER ${orderId}] Order (from Player ${player}) is complete!`);
}

async function prepareDish(dish, orderId) {
    const recipes = {
        burger: prepareBurger,
        salad: prepareSalad
    };

    if (!recipes[dish]) {
        throw new Error(`Recipe for ${dish} not found`);
    }

    await recipes[dish](orderId);
}

// === Dish Components ===

async function prepareBurger(orderId) {
    console.log("Start preparing Burger");
    await Promise.all([
        heatUpBread(),
        grillPatty(),
        preparePickle(orderId)
    ]);
    console.log("Finish preparing Burger");
}

async function prepareSalad(orderId) {
    console.log("Start preparing Salad");
    await washVeggies();
    await cutVeggies();
    console.log("Finish preparing Salad");
}

async function washVeggies() {
    console.log("Start Wash Veggies");
    await sleep(Math.random() * 40);
    console.log("Finish Wash Veggies");
}

async function cutVeggies() {
    console.log("Start Cut Veggies");
    await sleep(Math.random() * 40);
    console.log("Finish Cut Veggies");
}

async function grillPatty() {
    console.log("Start Grill Patty");
    await sleep(20);
    console.log("Finish Grill Patty");
}

async function heatUpBread() {
    console.log("Start Heat Up Bread");
    await sleep(Math.random() * 40);
    console.log("Finish Heat Up Bread");
}

async function preparePickle(orderId) {
    const count = await getPickleCountFor(orderId);
    for (let i = 1; i <= count; i++) {
        console.log(`Prepare Pickle ${i} for Burger`);
        await sleep(Math.random() * 40);
    }
}