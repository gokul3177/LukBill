const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const billRoutes = require('./routes/billRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/lukbill')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/bills', billRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('LukBill API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
