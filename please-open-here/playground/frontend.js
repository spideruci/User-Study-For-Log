    const apiEndpoints = [
      'https://jsonplaceholder.typicode.com/posts/1',
      'https://jsonplaceholder.typicode.com/users/1',
      'https://jsonplaceholder.typicode.com/invalid-url', // <-- will cause real error
      'https://jsonplaceholder.typicode.com/comments/1'
    ];

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getApiLabel(api) {
      return api.split('.com/')[1]; // get the part after the first slash
    }

    async function fetchRemoteResources(api) {
      const label = getApiLabel(api);
      console.log(`>> [${label}] Start fetch`);
      await delay(Math.random() * 1000); // simulate jitter
      const res = await fetch(api); // if invalid, will reject
      const data = await res.json(); // could throw if not JSON
      console.log(`<< [${label}] Done`);
      return data;
    }

    async function updateStatus(message) {
      document.getElementById('status').innerText = message;
      await delay(30);
    }

    async function fetchAndDisplayResources() {
      const resultsContainer = document.getElementById('results');

      await updateStatus('Fetching resources...');

      // Async trap: not awaited individually
      const promises = apiEndpoints.map(async (api, i) => {
        const data = await fetchRemoteResources(api); // will throw if failed
        const li = document.createElement('li');
        li.textContent = `[${i}] ${getApiLabel(api)} - ${data.title || data.name || 'No title'}`;
        resultsContainer.appendChild(li);
        await delay(100); // simulate slow UI
      });

      // Allow unhandled errors to surface naturally
      await Promise.all(promises);

      await updateStatus('All done.');
    }

    for (let i = 0; i < 20; i ++) {
        fetchAndDisplayResources();
    }
