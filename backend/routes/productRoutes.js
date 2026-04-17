const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Simple Levenshtein distance implementation for fuzzy matching
const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
};

// Get prices for multiple items by name, aliases or fuzzy match
router.post('/prices', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) return res.json({});

        const allProducts = await Product.find({});
        const priceMap = {};

        items.forEach(searchTerm => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return;

            // 1. Exact Match or Alias Match
            let match = allProducts.find(p =>
                p.name === term || (p.aliases && p.aliases.includes(term))
            );

            // 2. Contains Match (e.g. "pencils" contains "pencil")
            if (!match) {
                match = allProducts.find(p =>
                    term.includes(p.name) || (p.aliases && p.aliases.some(a => term.includes(a)))
                );
            }

            // 3. Fuzzy Match (Strict)
            if (!match) {
                let minDistance = 2; // Stricter tolerance for better accuracy
                allProducts.forEach(p => {
                    const dist = getLevenshteinDistance(term, p.name);
                    if (dist < minDistance) {
                        minDistance = dist;
                        match = p;
                    }
                });
            }

            if (match) {
                priceMap[term] = {
                    price: match.price,
                    name: match.name // Correct official name
                };
            }
        });

        console.log(`Matched ${Object.keys(priceMap).length}/${items.length} items`);
        res.json(priceMap);
    } catch (error) {
        console.error("Backend Pricing Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Add a new product
router.post('/', async (req, res) => {
    try {
        const { name, price } = req.body;

        const newProduct = new Product({
            name: name.toLowerCase().trim(),
            price
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Product already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// Seed initial products (for testing)
router.post('/seed', async (req, res) => {
    try {
        const initialProducts = [
            { name: 'pencil', price: 5 },
            { name: 'pen', price: 10 },
            { name: 'sharpener', price: 8 },
            { name: 'eraser', price: 5 },
            { name: 'notebook', price: 50 },
            { name: 'ruler', price: 15 },
            { name: 'apple', price: 100 },
            { name: 'orange', price: 50 },
            { name: 'banana', price: 30 },
            { name: 'milk', price: 80 },
            { name: 'bread', price: 45 },
            { name: 'eggs', price: 120 }
        ];

        // Clear existing products
        await Product.deleteMany({});

        // Insert initial products
        const products = await Product.insertMany(initialProducts);

        res.json({ message: 'Products seeded successfully', count: products.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
