"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
const navLinks = [
  { title: "Dashboard", path: "/" },
  { title: "Suppliers", path: "/suppliers" },
  { title: "Customers", path: "/customers" },
  { title: "Consignments", path: "/consignments" },
  { title: "Products", path: "/products" },
  { title: "Payments", path: "/payments" },
  { title: "Reports", path: "/reports" },
  { title: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
      <div>
        <div className="p-4 text-2xl font-bold text-blue-600">LogiManage</div>
        <nav className="mt-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.path}
              className={`block px-6 py-2.5 text-sm font-medium rounded-l-full ${
                pathname === link.path
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-300" />
        <div>
          <p className="text-sm font-semibold">Alex Smith</p>
          <p className="text-xs text-gray-500">admin@logimanage.com</p>
        </div>
        <BiLogOut
          className="ml-auto cursor-pointer text-gray-500 hover:text-red-600"
          size={18}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
