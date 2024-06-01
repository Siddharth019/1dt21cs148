// app.js

const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'http://20.244.56.144/test/companies';
const companies = ['A', 'FLP', 'SPO', 'TAR', 'BO'];
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjIyNDM0LCJpYXQiOjE3MTcyMjIxMzQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjJhN2U1NTA2LWIxNDktNDIwZC1hYmNiLTkyODg5MDYxMmI1NSIsInN1YiI6IjFkdDIxY3MxNDhAZHNhdG0uZWR1LmluIn0sImNvbXBhbnlOYW1lIjoibmVyZHRlY2giLCJjbGllbnRJRCI6IjJhN2U1NTA2LWIxNDktNDIwZC1hYmNiLTkyODg5MDYxMmI1NSIsImNsaWVudFNlY3JldCI6ImphZ0hrUVhxVUxsTVNheWIiLCJvd25lck5hbWUiOiJzaWRkaGFydGgga3VtYXIiLCJvd25lckVtYWlsIjoiMWR0MjFjczE0OEBkc2F0bS5lZHUuaW4iLCJyb2xsTm8iOiIxZHQyMWNzMTQ4In0.tJQOszklg4WDPNkj2fMTcR7UUqjfwFOaJ7cHe6Y-Ngg";

// Helper function to fetch products from a company
async function fetchProducts(company, category, minPrice, maxPrice) {
  const url = `${BASE_URL}/${company}/categories/${category}/products/top-10?minPrice=${minPrice}&maxPrice=${maxPrice}`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

// Route to get top N products within a category
app.get('/api/categories/:category/products', async (req, res) => {
  const { category } = req.params;
  const { n = 10, page = 1, sort = 'price', order = 'asc', minPrice = 0, maxPrice = 10000 } = req.query;

  try {
    let products = [];

    // Fetch products from all companies
    for (const company of companies) {
      const companyProducts = await fetchProducts(company, category, minPrice, maxPrice);
      products = products.concat(companyProducts.map(data => ({
        id: uuidv4(),
        name: data.productName,
        price: data.price,
        rating: data.rating,
        discount: data.discount,
        availability: data.availability
      })));
    }

    // Sort products based on query parameters
    products.sort((a, b) => {
      if (order === 'asc') {
        return a[sort] - b[sort];
      } else {
        return b[sort] - a[sort];
      }
    });

    // Implement pagination
    const startIndex = (page - 1) * n;
    const endIndex = startIndex + Number(n);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json(paginatedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get product details by ID
app.get('/api/categories/:category/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const { category } = req.params;

  try {
    let product;

    // Search for the product in all companies
    for (const company of companies) {
      const companyProducts = await fetchProducts(company, category, 0, 10000);
      const foundProduct = companyProducts.find(p => p.productName === productId);
      if (foundProduct) {
        product = foundProduct;
        break;
      }
    }

    if (product) {
      res.json({
        id: uuidv4(),
        name: product.productName,
        price: product.price,
        rating: product.rating,
        discount: product.discount,
        availability: product.availability
      });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
