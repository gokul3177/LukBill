const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    billTo: { type: String, required: true },
    billDate: { type: Date, required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    bankAccount: { type: String },
    grandTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
