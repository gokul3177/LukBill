# LukBill

LukBill is a modern, smart billing application tailored for shopkeepers. With AI-powered voice dictation (powered by Groq / Llama 3), dark mode, UPI QR code generation, and historical analytics, creating and managing bills has never been faster.

## 🚀 Features

- **Store & Product Management:** Initialize an item catalog with standard pricing.
- **AI Voice Assistance:** Speak to create bills (e.g., "Bill for John items 5 pencils and 2 notebooks"); the AI automatically extracts the customer and line items.
- **Smart Suggestions:** Intelligent fuzzy-finding for items missing prices and suggestions directly within the interface.
- **UPI QR Code Generation:** Generate an invoice containing an actionable UPI payment QR code dynamically linked to the total bill amount.
- **Print & PDF Mode:** A beautifully customized format tailored specifically for A4 invoice printing.
- **Bill Analytics & History:** Easily track daily revenue, search past bills by date, and identify best-selling products.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI Model:** Groq API (Llama-3-70b-8192)

## 📦 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017

### 1. Database & Backend

Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
```

**Seed Initial Data:** Let's populate the database with default products!
```bash
node seedProducts.js
```

**Start the API Server:**
```bash
npm start   # If using nodemon
```
The backend API will run on `http://localhost:5000`.

### 2. Frontend Application

Open another terminal and navigate to the client folder:
```bash
cd client
npm install
```

**Configuration:** Ensure your `.env` file exists inside the `client` folder with your credentials. You can set this up as follows:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_UPI_ID=your_upi_id@bank
VITE_UPI_NAME=LukBill
```

**Start the Dev Server:**
```bash
npm run dev
```
The React Application will spin up locally (e.g., `http://localhost:5173`).

## 🎤 How to Use the App

1. **New Bill:** Make sure your microphone is allowed in your browser. Tap the microphone icon, and dictate clearly: *"Bill to Raj items 5 apples and 2 milk"*. The AI will automatically organize the invoice and fetch prices from the database!
2. **Review & Edit:** Review the populated invoice. You can manually adjust quantities, delete items, or add items from the "Smart Suggestions" autocomplete box.
3. **Save & Print:** Click "Save Bill" to store the transaction to MongoDB, then hit the "Print" icon to print or save the final generated copy (which natively includes the auto-filled UPI QR Code).
4. **Search Dashboard:** Navigate to `Search Bills` at the top right to view historical transactions, see your total daily revenue, and find your best-selling product!

---
*Created dynamically for smart, fast processing. ⚡*
