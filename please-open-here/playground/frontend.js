const apiEndpoints = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/users/1',
  'https://jsonplaceholder.typicode.com/comments/1'
];

async function fetchAndDisplayResources() {
  const resultsContainer = document.getElementById('results');

  try {
    const fetchPromises = apiEndpoints.map(url =>
      fetch(url).then(res => res.json())
    );

    const results = await Promise.all(fetchPromises);

    results.forEach((result, index) => {
      const apiUrl = apiEndpoints[index];
      console.log(`Response from ${apiUrl}:`, result);

      const responseBlock = document.createElement('div');
      responseBlock.className = 'response';
      responseBlock.innerText = `From ${apiUrl}:\n` + JSON.stringify(result, null, 2);
      resultsContainer.appendChild(responseBlock);
    });
  } catch (error) {
    console.error('Error fetching APIs:', error);
    resultsContainer.innerText = 'Error fetching resources. Check console for details.';
  }
}

fetchAndDisplayResources();