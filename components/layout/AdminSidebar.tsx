"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Calendar, 
  FileText, 
  Wallet, 
  MessageCircle, 
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/programs", label: "Program Kerja", icon: FolderOpen },
  { href: "/admin/events", label: "Agenda", icon: Calendar },
  { href: "/admin/meetings", label: "Notulen Rapat", icon: FileText },
  { href: "/admin/finance", label: "Keuangan", icon: Wallet },
  { href: "/admin/messages", label: "Pesan NGL", icon: MessageCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopMinimized, setIsDesktopMinimized] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const toggleDesktop = () => setIsDesktopMinimized(!isDesktopMinimized);

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary-900 text-white border-r border-primary-800 overflow-hidden">
      <div className={`flex items-center p-6 ${isDesktopMinimized ? 'justify-center' : 'justify-between'}`}>
        {!isDesktopMinimized && (
          <div className="flex items-center gap-3">
            <span className="font-display font-bold tracking-tight text-lg whitespace-nowrap">Admin Gemasix</span>
          </div>
        )}
        <button className="hidden lg:block text-primary-200 hover:text-white" onClick={toggleDesktop}>
          {isDesktopMinimized ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
        <button className="lg:hidden text-primary-200 hover:text-white" onClick={closeSidebar}>
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              title={isDesktopMinimized ? item.label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-all ${
                isDesktopMinimized ? 'justify-center px-0' : 'px-3'
              } ${
                isActive 
                  ? "bg-primary-800 text-white font-medium" 
                  : "text-primary-200 hover:bg-primary-800/50 hover:text-white"
              }`}
            >
              <item.icon size={20} className={`shrink-0 ${isActive ? "text-accent-yellow-400" : "text-primary-400"}`} />
              {!isDesktopMinimized && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-800">
        <button 
          onClick={handleLogout}
          title={isDesktopMinimized ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-primary-300 hover:bg-primary-800 hover:text-white transition-colors ${
            isDesktopMinimized ? 'justify-center px-0' : 'px-3'
          }`}
        >
          <LogOut size={20} className="shrink-0 text-accent-red-400" />
          {!isDesktopMinimized && (
            <span className="text-sm whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between bg-primary-900 text-white p-4 sticky top-0 z-40 border-b border-primary-800 mb-5">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold tracking-tight text-sm">Admin Gemasix</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 text-primary-200 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isDesktopMinimized ? 88 : 256 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="hidden lg:block h-screen sticky top-0 shrink-0"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
