import { BrowserRouter, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Analytics from "../pages/Analytics/Analytics";
import Dashboard from "../pages/Dashboard/Dashboard";
import GISMap from "../pages/GISMap/GISMap";
import LiveMonitoring from "../pages/LiveMonitoring/LiveMonitoring";
import Maintenance from "../pages/Maintenance/Maintenance";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/gis-map" element={<GISMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}