const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true },
    aliases: [{ type: String, lowercase: true, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
