import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CompanyInfo from "./pages/CompanyInfo";
import FundingSelection from "./pages/FundingSelection";
import DocumentsReview from "./pages/DocumentsReview";
import Submit from "./pages/Submit";
import Portal from "./pages/Portal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/app/company" element={<CompanyInfo />} />
        <Route path="/app/funding" element={<FundingSelection />} />
        <Route path="/app/review" element={<DocumentsReview />} />
        <Route path="/app/submit" element={<Submit />} />
        <Route path="/portal" element={<Portal />} />
      </Routes>
    </BrowserRouter>
  );
}
