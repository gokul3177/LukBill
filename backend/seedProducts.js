const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true },
    aliases: [{ type: String, lowercase: true, trim: true }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const seedProducts = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/lukbill');
        console.log('MongoDB Connected');

        const initialProducts = [
            { name: 'pencil', price: 5, aliases: ['pencils', 'pensil', 'pencal', 'sketch pen'] },
            { name: 'pen', price: 10, aliases: ['pens', 'ball pen', 'ink pen', 'gel pen', 'ben'] },
            { name: 'sharpener', price: 8, aliases: ['sharpeners', 'sharpness', 'sharpner', 'shaper'] },
            { name: 'eraser', price: 5, aliases: ['erasers', 'rubber', 'erase', 'erazor'] },
            { name: 'notebook', price: 50, aliases: ['notebooks', 'book', 'textbook', 'note book', 'note books'] },
            { name: 'ruler', price: 15, aliases: ['rulers', 'rule', 'scale', 'scales', 'measure'] },
            { name: 'apple', price: 100, aliases: ['apples', 'apel', 'apel'] },
            { name: 'orange', price: 50, aliases: ['oranges', 'oringe'] },
            { name: 'banana', price: 30, aliases: ['bananas', 'banna'] },
            { name: 'milk', price: 80, aliases: ['milks', 'melk', 'silk'] },
            { name: 'bread', price: 45, aliases: ['breads', 'bred'] },
            { name: 'egg', price: 120, aliases: ['eggs', 'eg', 'beg'] },
            { name: 'scale', price: 15, aliases: ['scales', 'ruler', 'rulers'] }
        ];

        await Product.deleteMany({});
        console.log('Cleared existing products');

        const products = await Product.insertMany(initialProducts);
        console.log(`✅ Seeded ${products.length} products successfully!`);

        console.log('\nProducts in database:');
        products.forEach(p => console.log(`  - ${p.name}: ₹${p.price}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedProducts();
