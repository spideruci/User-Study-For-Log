async function fetchDataAndProcess() {

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function test () {
        console.log('test');
    }

    async function fetchMockData(id) {
        await delay(1000); // Simulate network delay
        console.log(`📡 Fetching data for ID: ${id}`);
        test();
        return { id, value: Math.random() * 100 };
    }

    async function processNestedData(level, id) {
        console.log(`🔄 Processing level ${level} for ID: ${id}`);
        await delay(1000); // Simulate network delay

        if (level > 3) {
            console.log(`✅ Reached max recursion depth at level ${level}`)
            return `Processed-${id}`;
        }

        const data = await fetchMockData(id);
        console.log(`🔍 Processed Data (Level ${level}):`, data);

        return await processNestedData(level + 1, data.value.toFixed(2));
    }

    async function parallelProcessing(ids) {
        console.log("🌐 Starting parallel async processing...");
        const results = [];
        for (const id of ids) {
            const result = await processNestedData(1, id);
            results.push(result);
        }        
        // const results = await Promise.all(ids.map(id => processNestedData(1, id)));
        console.log("🎉 Final processed results:", results);
    }

    await parallelProcessing([1, 2, 3]);

}

function app() {
    console.log("hi");
}

fetchDataAndProcess();