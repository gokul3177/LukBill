# LukBill 2.0 🏥

LukBill 2.0 is a modern, AI-powered clinic management and billing application tailored specifically for doctors and medical clinics. It features AI-driven voice prescriptions, patient history tracking, smart inventory management, and an integrated "Hey Luk" voice assistant to streamline the doctor's workflow.

## 🚀 Features

- **Authentication & Clinic Setup:** Secure JWT authentication with customized clinic profiles (Doctor name, Registration number, UPI setup, Consultation fees).
- **Patient Management & History:** Register patients, maintain detailed consultation histories, and track all past bills and prescriptions.
- **AI Voice Prescriptions:** Speak your prescriptions directly! The app uses the Groq API (Llama 3.1) to accurately parse spoken medicines, dosages, timings, and durations.
- **Smart Inventory & Fuzzy Matching:** Intelligent fuzzy-matching automatically links spoken medicine names to your live inventory. 
- **Low Stock Alerts:** Get notified immediately when medicine stock falls below your customized threshold.
- **"Hey Luk" Voice Assistant:** A hands-free WebSocket-powered assistant. Say *"Hey Luk, next patient"* or *"Hey Luk, open inventory"* to navigate the app without touching the mouse.
- **UPI QR Code Billing:** Instantly generate printable bills containing a dynamic UPI QR code for seamless patient payments.
- **Print & PDF Mode:** Beautifully formatted, print-ready A4 templates for both prescriptions and final invoices.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS, React Router, React Hot Toast
- **Backend:** Node.js, Express.js, WebSockets (ws)
- **Database:** MongoDB & Mongoose
- **AI Integration:** Groq API (`llama-3.1-8b-instant`) for natural language parsing

## 📦 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running (or a MongoDB Atlas URI)
- A [Groq API Key](https://console.groq.com/keys)

### 1. Database & Backend Configuration

Open a terminal and navigate to the `server` folder:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure your environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lukbill2
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
```

**Start the API Server:**
```bash
npm run dev   # Uses nodemon (if configured) or node index.js
```
The backend API and WebSocket server will run on `http://localhost:5000`.

### 2. Frontend Application

Open another terminal and navigate to the `client` folder:
```bash
cd client
npm install
```

**Start the Dev Server:**
```bash
npm run dev
```
The React application will automatically proxy API requests to port 5000. Open the local link (usually `http://localhost:5173`) in your browser.

## 🎤 How to Use the App

1. **Register & Setup:** Create a new account and fill out your Clinic details (Name, Consultation Fee, UPI ID, etc.).
2. **Inventory Management:** Navigate to "Inventory" to add your available medicines, prices, and stock levels.
3. **New Patient Consult:** Click "New Patient", register or select an existing patient, and proceed to the Voice Prescription page.
4. **Speak the Prescription:** Tap the microphone and speak (e.g., *"Paracetamol 500mg 1-0-1 for 5 days"*). The AI extracts the details and maps them to your inventory.
5. **Approve & Bill:** Review the matches, approve the prescription, and generate the final bill complete with an actionable UPI QR code. 
6. **Hey Luk Assistant:** Click the "Hey Luk" button in the navbar to enable continuous listening. Command the app via voice to navigate between screens seamlessly.

---
*LukBill 2.0 — Built to save doctors time, every single day. ⚡*
