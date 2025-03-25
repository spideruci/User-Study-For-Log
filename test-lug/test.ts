async function asyncTask(id: number): Promise<string> {
    return new Promise((resolve) => {
        const delay = Math.floor(Math.random() * 2000) + 1000; // Random delay between 1-3 seconds
        setTimeout(() => {
            console.log(`Task ${id} completed after ${delay}ms`);
            resolve(`Result from task ${id}`);
        }, delay);
    });
}

async function executeTasksConcurrently(): Promise<void> {
    const taskCount = 5;
    const tasks: Promise<string>[] = [];

    // Using a for loop to create multiple asynchronous tasks
    for (let i = 1; i <= taskCount; i++) {
        tasks.push(asyncTask(i));
    }

    console.log("Executing all tasks concurrently...");
    
    // Wait for all tasks to complete
    const results = await Promise.all(tasks);

    console.log("All tasks completed:", results);
}

executeTasksConcurrently().catch(console.error);