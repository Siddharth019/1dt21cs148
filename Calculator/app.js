// app.js

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;

const BASE_URL = 'http://20.244.56.144/test/numbers';
const WINDOW_SIZE = 10;

let windowState = [];

// Helper function to fetch numbers from the test server
async function fetchNumbers(type) {
  try {
    const response = await axios.get(`${BASE_URL}/${type}`, { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
}

// Route to get numbers and calculate the average
app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  try {
    const numbers = await fetchNumbers(type);
    const uniqueNumbers = [...new Set(numbers)];

    const windowPrevState = [...windowState];
    windowState = [...windowState, ...uniqueNumbers].slice(-WINDOW_SIZE);

    const avg = windowState.reduce((sum, num) => sum + num, 0) / windowState.length;

    res.json({
      numbers: uniqueNumbers,
      windowPrevState,
      windowCurrState: windowState,
      avg: avg.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
