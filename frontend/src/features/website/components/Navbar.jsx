import React from "react";
import { Link, NavLink } from "react-router-dom";
import { websiteNavLinks } from "../../../constants/navLinks";
import { useAuth } from "../../../services/auth-context";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-bold text-gray-900">
          Vita Forge
        </Link>
        <ul className="flex items-center gap-4">
          {websiteNavLinks.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-sky-600" : "text-gray-600 hover:text-gray-900"}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          {!isLoading && (
            <li>
              <NavLink
                to={isAuthenticated ? "/dashboard" : "/login"}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-sky-600" : "text-gray-600 hover:text-gray-900"}`
                }
              >
                {isAuthenticated ? "Go to app" : "Log in"}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
