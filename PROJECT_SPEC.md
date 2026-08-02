# LukBill 2.0 - Project Specification

## 1. Overview
**LukBill 2.0** is a modern, smart clinic management and medical billing application. Its core differentiator is AI-powered voice dictation for prescriptions—allowing doctors to simply dictate a patient's prescription, which the system automatically transcribes, parses, matches to inventory, and bills. 

It also includes a voice-activated "Hey Luk" assistant via WebSockets that can be used hands-free during consultations.

**Target Users:** Doctors and Clinic Owners who need rapid, hands-free prescription generation, inventory management, and patient history tracking.

---

## 2. Tech Stack
### Frontend (Client)
- **Framework:** React.js (v19.2.0) with Vite (v7.2.4)
- **Styling:** Tailwind CSS (v3.4.19), PostCSS
- **HTTP Client:** Axios
- **Utilities:** Web Speech API for voice recognition

### Backend (API)
- **Runtime / Framework:** Node.js, Express (v5.2.1)
- **Database / ORM:** MongoDB, Mongoose (v9.7.3)
- **Authentication:** `jsonwebtoken`, `bcryptjs`, OTP via Email (`nodemailer`)
- **Realtime:** `ws` (WebSockets) for the "Hey Luk" assistant
- **Utilities:** `cors`, `dotenv`

---

## 3. Architecture
The project follows a decoupled SPA and REST API architecture:
- **Frontend SPA** (`client/`): Renders the UI, manages authentication state, captures audio using the browser's Web Speech API, and communicates with the backend.
- **Backend API** (`server/`): An Express server that handles CRUD operations, authentication, fuzzy-matching for inventory, and forwards AI transcription data to Groq.
- **Database**: MongoDB handles data persistence.

### Folder Breakdown
```
E:\lukBill_2.0\LukBill\
├── PROJECT_SPEC.md           # Project Specification & Documentation
├── server/                   # Node.js API Server
│   ├── middleware/           # JWT Auth Middleware
│   ├── models/               # Mongoose DB Schemas (User, Clinic, Patient, Medicine, etc.)
│   ├── routes/               # Express API Routes (auth, clinic, patients, inventory, etc.)
│   ├── utils/                # Helper functions (fuzzy match, email sender, Groq API)
│   ├── index.js              # API entry point & WebSocket Server setup
│   └── package.json          
├── client/                   # React Frontend App
│   ├── src/
│   │   ├── components/       # Reusable UI components (MedicineTable, HeyLuk, PrintTemplate)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Page Views (Dashboard, ClinicSetup, VoicePrescription, etc.)
│   │   ├── App.jsx           # Main routing setup
│   │   ├── index.css         # Tailwind directives
│   │   └── main.jsx          # React DOM mounting
│   ├── tailwind.config.js    
│   ├── vite.config.js        # Vite config with API proxy to port 5000
│   └── package.json          
```

---

## 4. Data Models / Schema

- **User**: Clinic owners/doctors (name, email, passwordHash, clinicId).
- **Clinic**: Clinic configuration (name, doctor, address, phone, registrationNo, consultationFee, lowStockThreshold).
- **Patient**: Patient demographics and visit history.
- **Medicine**: Inventory items (name, category, price, stock, expiryDate).
- **Prescription**: Links patient, clinic, and medicines (dosage, timing, instructions).
- **Bill**: Finalized invoice generated from an approved prescription, tracking item totals and grand total.
- **Otp & PasswordResetLog**: For secure password recovery flows.

---

## 5. API Endpoints / Routes

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, forgot password, verify OTP, reset password. |
| `/api/clinic` | Create or fetch clinic configuration. |
| `/api/patients` | Register patients, search patients, get patient history. |
| `/api/inventory` | CRUD operations for clinic medicines and stock. |
| `/api/voice` | Sends transcript to Groq and performs fuzzy matching against inventory. |
| `/api/prescriptions` | Create and approve prescriptions. |
| `/api/billing` | Generate final bills from prescriptions and fetch billing history. |

---

## 6. Core Business Logic
*   **AI Transcription Parsing (`server/utils/groqParser.js`):** 
    The frontend records voice and sends the transcript to the backend `/api/voice/parse` endpoint. The backend calls the Groq API (Llama 3) requesting strict JSON formatting to extract patient intent and medicine dosages.
*   **Smart Pricing & Fuzzy Matching (`server/utils/fuzzyMatch.js`):** 
    Extracted medicines are fuzzy-matched (Levenshtein distance) against the clinic's actual inventory to automatically resolve prices and check stock levels.
*   **Hey Luk Assistant (`server/index.js` & `HeyLuk.jsx`):** 
    A voice-activated WebSockets assistant. Saying "Hey Luk, call assistant" broadcasts a notification payload to all connected devices in the same clinic in real-time.
*   **Server-Side Security & Billing:** 
    Total calculation and inventory deduction occur strictly on the backend during `/api/billing/generate` to prevent client-side tampering.

---

## 7. Environment & Config
### Client Environment (`client/.env`)
Required variables for the React frontend:
- `VITE_API_URL`: (Optional) Custom API URL for WebSockets. Defaults to `ws://localhost:5000`.

### Server Config (`server/.env`)
Required variables for the Express backend:
- `PORT`: Usually 5000.
- `MONGODB_URI`: Connection string (e.g., `mongodb://127.0.0.1:27017/LukBill`).
- `JWT_SECRET`: Secret key for signing Auth tokens.
- `GROQ_API_KEY`: API key for Llama 3 parsing.
- `EMAIL_USER` & `EMAIL_PASS`: SMTP credentials for sending OTPs.

---

## 8. Setup & Build Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### Backend Setup
1. Open a terminal and navigate to the server directory:
   ```bash
   cd server
   npm install
   ```
2. Start the backend development server:
   ```bash
   npm start
   ```
   *(Server runs on `http://localhost:5000`)*

### Frontend Setup
1. Open a separate terminal and navigate to the client directory:
   ```bash
   cd client
   npm install
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173` with proxy to 5000)*

3. **Production Build:** Run `npm run build` inside the `client/` folder.

---

## 9. Known Gaps / TODOs
1. **Audio Transcription**: Currently uses browser's Web Speech API. Upgrading to a direct audio recording + `openai/whisper-large-v3-turbo` model is planned for higher medical terminology accuracy.
2. **Transaction Rollback**: Stock decrement logic in `billing.js` is not currently wrapped in a MongoDB transaction, which could lead to stock discrepancies on partial failures.
3. **Regex Search Sanitization**: Patient search endpoints construct regex directly from query strings, needing sanitization to avoid crashes on special characters.
4. **WebSocket Reconnection**: The frontend `HeyLuk.jsx` component lacks automatic exponential backoff/reconnection if the socket drops.
