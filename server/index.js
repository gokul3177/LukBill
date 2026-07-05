const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { WebSocketServer } = require('ws');

// Route imports
const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinic');
const patientRoutes = require('./routes/patients');
const inventoryRoutes = require('./routes/inventory');
const voiceRoutes = require('./routes/voice');
const prescriptionRoutes = require('./routes/prescriptions');
const billingRoutes = require('./routes/billing');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket Server
const wss = new WebSocketServer({ server });

// Map to store connected clients by clinicId
// Key: clinicId string, Value: Set of WebSocket connections
const clinicClients = new Map();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  // Extract clinicId from the query string (e.g. ?clinicId=...)
  // Alternatively, could be passed in headers, but query is easier for WS from browser
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const clinicId = urlParams.get('clinicId');

  if (clinicId) {
    if (!clinicClients.has(clinicId)) {
      clinicClients.set(clinicId, new Set());
    }
    clinicClients.get(clinicId).add(ws);
    ws.clinicId = clinicId;
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle HEY_LUK commands
      if (data.type === 'CALL_ASSISTANT' && ws.clinicId) {
        // Broadcast to all other clients in the same clinic
        const clients = clinicClients.get(ws.clinicId);
        if (clients) {
          clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) { // 1 = OPEN
              client.send(JSON.stringify({ type: 'ASSISTANT_CALLED', message: data.message }));
            }
          });
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error', e);
    }
  });

  ws.on('close', () => {
    if (ws.clinicId && clinicClients.has(ws.clinicId)) {
      clinicClients.get(ws.clinicId).delete(ws);
      if (clinicClients.get(ws.clinicId).size === 0) {
        clinicClients.delete(ws.clinicId);
      }
    }
    console.log('WebSocket connection closed');
  });
});

// Pass wss to request object so routes can broadcast if needed
app.use((req, res, next) => {
  req.wss = wss;
  req.clinicClients = clinicClients;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected to', process.env.MONGODB_URI))
  .catch(err => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('LukBill 2.0 API is running');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
