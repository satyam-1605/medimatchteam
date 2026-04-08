import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SymptomAnalysis from "./pages/SymptomAnalysis";
import Results from "./pages/Results";
import DoctorDirectory from "./pages/DoctorDirectory";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import VideoCall from "./pages/VideoCall";
import DoctorDashboard from "./pages/DoctorDashboard";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/symptoms" element={<SymptomAnalysis />} />
          <Route path="/results" element={<Results />} />
          <Route path="/doctors" element={<DoctorDirectory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/video-call/:appointmentId" element={<VideoCall />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
