// AppRouter.tsx
import {
  Route,
  Routes,
  Outlet,
  Navigate
} from "react-router-dom";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import DataProvisionPage from "./components/DataProvisionPage";
import { useContext } from "react";
import { WalletConnectContext } from "./contexts/WalletConnectContext";
import SurveyPage from "./pages/Survey";
import ResearchPage from "./pages/ResearchPage";
import ReviewPage from "./pages/ReviewPage";



export const ProtectedRoute = () => {
  const { isConnected } = useContext(WalletConnectContext);
  // Redirect to the landing page if not connected
  return isConnected ? <Outlet /> : <Navigate to="/" />;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/provision" element={<DataProvisionPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Route>
    </Routes>
  );
}