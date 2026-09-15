/* src/core/layouts/AppLayout.jsx */

import React from "react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "../features/auth";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <AppNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
