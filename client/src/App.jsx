import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ClinicSetup from './pages/ClinicSetup';
import Dashboard from './pages/Dashboard';
import PatientRegister from './pages/PatientRegister';
import VoicePrescription from './pages/VoicePrescription';
import PrescriptionReview from './pages/PrescriptionReview';
import BillPreview from './pages/BillPreview';
import Inventory from './pages/Inventory';
import PatientHistory from './pages/PatientHistory';
import Navbar from './components/Navbar';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute requireClinicSetup={false} />}>
            <Route path="/clinic-setup" element={<ClinicSetup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/patients/new" element={<AppLayout><PatientRegister /></AppLayout>} />
            <Route path="/prescribe" element={<AppLayout><VoicePrescription /></AppLayout>} />
            <Route path="/prescribe/review" element={<AppLayout><PrescriptionReview /></AppLayout>} />
            <Route path="/bill/:id" element={<AppLayout><BillPreview /></AppLayout>} />
            <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
            <Route path="/patients/:id/history" element={<AppLayout><PatientHistory /></AppLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
