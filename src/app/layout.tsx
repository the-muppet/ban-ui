'use client'

import "./globals.css";
import { motion } from "framer-motion"
import Button from "@/app/components/ui/Button";
import { Home, User, Bell, Settings, LogOut, Menu, X, ChevronRight, Search, Newspaper, Upload, Euro } from "lucide-react";
import Navigation from "@/app/components/ui/Navigation";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Properly implement the cn function
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}


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
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
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
}: {
  title?: string
}) {
  const words = title.split(" ")

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          style={{ maxWidth: "32rem", margin: "0 auto" }}
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
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
                    style={{
                      display: 'inline-block',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundImage: 'linear-gradient(to right, white, rgb(156 163 175))',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <div
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button
              variant="ghost"
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
          bg-white/10 hover:bg-white/20
          text-white transition-all duration-300 
          group-hover:-translate-y-0.5 border border-white/20
          hover:shadow-md hover:shadow-red-900/30"
            >
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">Get Started</span>
              <span
                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
              >
                →
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface NavItem {
  label: string;
  href: string;
  icon: any; // Using any temporarily to resolve the type conflict
  badge?: number | string;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  userId?: string;
}

// Make this the default export
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
    </html>
  );
}

// Change to named export
export function PortalLayout({
  children,
  userName = 'User Name',
  userEmail = 'user@example.com',
  avatarUrl,
  userId = '1',
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout min-h-screen bg-gradient-to-br from-background to-background-alt">
      {/* Sidebar for desktop */}
      <aside 
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out',
          'border-r border-color-border bg-glass-background backdrop-blur-xl',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header with Logo and Close button */}
        <div className="flex h-16 items-center justify-between border-b border-color-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="font-bold text-white">P</span>
            </div>
            <span className="text-xl font-semibold">Portal</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden p-1.5 rounded-full" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </Button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-color-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-white">{userName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">{userName}</span>
              <span className="text-xs text-color-text-muted truncate">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 transition-all',
                      isActive 
                        ? 'bg-gradient-primary text-white' 
                        : 'text-color-text-muted hover:bg-glass-background hover:text-color-text'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        isActive 
                          ? 'bg-white/20 text-white'
                          : 'bg-primary text-white'
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={16} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-color-border p-4">
          <Button 
            variant="ghost" 
            fullWidth={true}
            size="sm"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        'md:ml-64'
      )}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-color-border bg-glass-background backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden p-1.5 rounded-md" 
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </Button>
            
            <div className="md:ml-auto flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="p-1.5 rounded-full relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="p-1.5 rounded-full"
              >
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}