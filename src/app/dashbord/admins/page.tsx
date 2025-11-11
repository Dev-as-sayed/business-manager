"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLoader2Line,
  RiShieldUserLine,
  RiCalendarLine,
  RiMore2Fill,
  RiMailLine,
  RiPhoneLine,
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";

const AdminTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/users?role=admin");
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-3"
        >
          <RiLoader2Line className="h-6 w-6 text-primary" />
          <span className="text-text-secondary font-medium">
            Loading administrators...
          </span>
        </motion.div>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-12"
      >
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <RiShieldUserLine className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No Administrators
        </h3>
        <p className="text-text-secondary max-w-sm mx-auto">
          No administrator accounts found. Start by adding new admin users to
          manage your platform.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Administrators
          </h2>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Manage platform administrators and their permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {admins.length} {admins.length === 1 ? "Admin" : "Admins"}
          </div>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Administrator
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Join Date
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {admins.map((admin, index) => (
                  <motion.tr
                    key={admin._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-accent/50 transition-colors group"
                  >
                    {/* Admin Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {admin.avatar ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={admin.avatar}
                              alt={admin.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {getInitials(admin.name)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                            {admin.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                            <RiShieldUserLine className="w-3 h-3" />
                            Administrator
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <RiMailLine className="w-4 h-4" />
                          <span className="truncate max-w-[180px]">
                            {admin.email}
                          </span>
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <RiPhoneLine className="w-4 h-4" />
                            <span>{admin.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Join Date */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <RiCalendarLine className="w-4 h-4" />
                        <span>{formatDate(admin.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            admin.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            admin.isActive ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                          title="Edit admin"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          title="Delete admin"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-text-secondary hover:text-text-primary hover:bg-accent rounded-lg transition-all"
                          title="More options"
                        >
                          <RiMore2Fill className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View (Mobile) */}
      <div className="block md:hidden space-y-4">
        {admins.map((admin, index) => (
          <motion.div
            key={admin._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border rounded-xl p-4 bg-accent/30"
          >
            <div className="flex items-center gap-3 mb-3">
              {admin.avatar ? (
                <div className="relative h-12 w-12">
                  <Image
                    src={admin.avatar}
                    alt={admin.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(admin.name)}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-text-primary text-base">
                  {admin.name}
                </h4>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <RiShieldUserLine className="w-3 h-3" /> Administrator
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <RiMailLine className="w-4 h-4" /> {admin.email}
              </p>
              {admin.phone && (
                <p className="flex items-center gap-2">
                  <RiPhoneLine className="w-4 h-4" /> {admin.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <RiCalendarLine className="w-4 h-4" />{" "}
                {formatDate(admin.createdAt)}
              </p>
              <p className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    admin.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                {admin.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                title="Edit admin"
              >
                <RiEditLine className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                title="Delete admin"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-accent rounded-lg transition-all"
                title="More options"
              >
                <RiMore2Fill className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-border text-sm"
      >
        <div className="text-text-secondary">
          Showing {admins.length} of {admins.length} administrators
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-text-secondary">
              {admins.filter((a) => a.isActive).length} Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-text-secondary">
              {admins.filter((a) => !a.isActive).length} Inactive
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminTable;
