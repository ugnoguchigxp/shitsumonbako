import { Navigate, Route, Routes } from "react-router-dom";

import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { ThanksPage } from "./pages/ThanksPage";

const rawAdminPath = import.meta.env.VITE_ADMIN_PATH ?? "/internal/ndtj-admin";
const adminPath = rawAdminPath.startsWith("/") ? rawAdminPath : `/${rawAdminPath}`;

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/thanks" element={<ThanksPage />} />
      <Route path={adminPath} element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
