import { Navigate, Route, Routes } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AppProvider } from "@/context/AppContext";
import Create from "@/pages/Create/Create";
import Draft from "@/pages/Draft/Draft";
import Home from "@/pages/Home/Home";
import List from "@/pages/List/List";
import Vendor from "@/pages/Vendor/Vendor";
import PrivacyPolicy from "@/pages/Privacy/PrivacyPolicy";

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <>
        <Navbar />
        <Routes>
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/draft" element={<Draft />} />
          <Route path="/list" element={<List />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/index" replace />} />
        </Routes>
        <Footer />
      </>
    </AppProvider>
  );
}
