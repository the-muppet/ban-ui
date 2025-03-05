'use client'

import { motion } from "framer-motion";
import { Home, User, Bell, Settings, LogOut, Menu, X, Upload, Euro, ChevronRight } from "lucide-react";
import { Search, Newspaper } from "lucide-react";
import { ThemeProvider } from "@/app/context/Theme";
import Navigation from "@/app/components/ui/Navigation";
import Button from "@/app/components/ui/Button";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import '@/styes/portal.css';

const navItems = [
  { label: "Dashboard", href: "/", icon: Home, badge: undefined },
  { label: "Profile", href: "/profile", icon: User, badge: undefined },
  { label: "Search", href: "/search", icon: Search, badge: undefined },
  { label: "Arbit", href: "/arbit", icon: Euro, badge: undefined },
  { label: "User", href: "/user", icon: User, badge: undefined },
  { label: "Newspaper", href: "/newspaper", icon: Newspaper, badge: undefined },
  { label: "Upload", href: "/upload", icon: Upload, badge: undefined },
];

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="floating-paths">
      <svg className="floating-paths-svg" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        <defs>
          <linearGradient id="spectrum-gradient">
            <stop offset="0%" stopColor="#701709">
              <animate
                attributeName="stop-color"
                values="rgb(255, 255, 255);rgb(3, 105, 169);rgba(75, 2, 153, 0.6);rgb(181, 10, 10);rgb(9, 180, 75);rgb(255, 255, 255)"
                dur="20s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#3d0000">
              <animate
                attributeName="stop-color"
                values="rgb(255, 255, 255);rgb(3, 105, 169);rgba(75, 2, 153, 0.6);rgb(181, 10, 10);rgb(9, 180, 75);rgb(255, 255, 255)"
                dur="20s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="url(#redGradient)"
            fill="url(#spectrum-gradient)"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function BackgroundPaths({
  title = "Background Paths",
}) {
  const words = title.split(" ")

  return (
    <div className="background-paths-container">
      <div className="background-overlay">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="content-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="title-container"
        >
          <h1 className="main-title">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="title-word">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="animated-letter"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <div className="button-container">
            <Button
              variant="ghost"
              className="action-button"
            >
              <span className="button-text">Get Started</span>
              <span className="button-arrow">→</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Props interfaces
 */
function PortalLayout({
  children,
  userName = 'User Name',
  userEmail = 'user@example.com',
  userId = '1',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      {/* Sidebar for desktop */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar Header with Logo and Close button */}
        <div className="sidebar-header">
          <Link href="/" className="logo-container">
            <div className="logo">
              <span className="logo-text">P</span>
            </div>
            <span className="logo-name">Portal</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            className="close-sidebar-button" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </Button>
        </div>

        {/* User Profile Summary */}
        <div className="user-profile">
          <div className="user-profile-container">
            <div className="avatar-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="avatar-image" />
              ) : (
                <span className="avatar-placeholder">{userName.charAt(0)}</span>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href} className="nav-item">
                  <Link 
                    href={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`nav-badge ${isActive ? 'nav-badge-active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={16} className="active-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Button 
            variant="ghost" 
            className="logout-button"
            size="sm"
          >
            <LogOut size={16} className="logout-icon" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'content-shifted' : ''}`}>
        {/* Top Navigation Bar */}
        <header className="header">
          <div className="header-container">
            <Button 
              variant="ghost" 
              size="sm"
              className="menu-button" 
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </Button>
            
            <div className="header-actions">
              <Button 
                variant="ghost" 
                size="sm"
                className="notification-button"
              >
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="settings-button"
              >
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body>
          <Navigation navItems={[
            { name: "Home", short: "H", link: "/" },
            { name: "Search", short: "S", link: "/search" },
            { name: "Arbit", short: "A", link: "/arbit" },
            { name: "User", short: "U", link: "/user" },
            { name: "Newspaper", short: "N", link: "/newspaper" },
            { name: "Upload", short: "U", link: "/upload" },
          ]} />
          <main>
            {children}
          </main>
        </body>
      </ThemeProvider>
    </html>
  );
}

// Export PortalLayout as named export
export { PortalLayout };