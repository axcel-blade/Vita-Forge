import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/auth-context";
import "./profile-menu.css";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="profile-menu-avatar">{initial}</span>
      </button>
      {isOpen && (
        <ul className="profile-menu-dropdown" role="menu">
          <li role="none">
            <Link
              to="/account/settings"
              role="menuitem"
              className="profile-menu-item"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                void logout();
              }}
            >
              Log out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
