async function getPickleCountFor(orderId) {
    await sleep(10);

    // Formula to generate pickle count based on orderId
    const pickleCount = Math.max(1, Math.min(4, (orderId * 3 + 5) % 4 + 1));

    return pickleCount;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    getPickleCountFor,
    sleep
};