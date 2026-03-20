import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CompanyInfo from "./pages/CompanyInfo";
import FundingSelection from "./pages/FundingSelection";
import ProjectDetails from "./pages/ProjectDetails";
import DocumentsReview from "./pages/DocumentsReview";
import Submit from "./pages/Submit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/app/company" element={<CompanyInfo />} />
        <Route path="/app/funding" element={<FundingSelection />} />
        <Route path="/app/project" element={<ProjectDetails />} />
        <Route path="/app/review" element={<DocumentsReview />} />
        <Route path="/app/submit" element={<Submit />} />
      </Routes>
    </BrowserRouter>
  );
}
