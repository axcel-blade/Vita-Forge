import { Link, NavLink } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

const appNavLinks: { label: string; to: string }[] = [];

export default function AppNavbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="text-lg font-bold text-gray-900">
          Vita Forge
        </Link>
        <ul className="flex items-center gap-4">
          {appNavLinks.map((item) => (
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
          <li>
            <ProfileMenu />
          </li>
        </ul>
      </nav>
    </header>
  );
}
