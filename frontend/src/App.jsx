/*
 * src/App.jsx
 * 
 * Main Application Entry Point for Vita Forge
 * Initializes the React application and sets up routing.
 * 
 * @file App.jsx - Main app component that renders the routing system
 * @description This file serves as the root component that mounts all sub-applications
 */

import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "./components/Toast";

/**
 * App Component
 * The main application component that renders all Vita Forge applications
 */
export default function App() {
  // Render the routing system which handles navigation between apps
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}