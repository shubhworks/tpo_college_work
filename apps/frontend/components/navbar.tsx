"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "T&P Cell", href: "/tp-cell" },
  { name: "Contact Us", href: "/contact" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-7xl">
      <div className="bg-slate-200/40 backdrop-blur-lg border border-black/10 rounded-full shadow-xl px-6 py-3 w-full mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group md:mx-10 mx-4">
            <Image
              src={"/navLogo.png"}
              alt="Gyan Ganga Logo"
              width={70}
              height={70}
              className="hover:scale-110 transition-all duration-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 leading-tight text-sm">Gyan Ganga</span>
              <span className="text-xs text-gray-600 font-medium tracking-wide">Group of Institutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-around">
            <div className="flex items-center space-x-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-lg font-extrabold rounded-full transition-all duration-300 hover:scale-105 hover:bg-black/10 ${isActive(item.href)
                      ? "text-slate-800 bg-black/20 shadow-md"
                      : "text-slate-700 hover:text-slate-900"
                    }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-linear-to-r from-purple-300 to-white rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-black/10 transition-all duration-300 hover:scale-105"
            >
              <div className={`transition-all duration-300 ${isMenuOpen ? "rotate-180" : "rotate-0"}`}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu with AnimatePresence */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="border-t border-black/20 pt-4">
                <div className="flex flex-col space-y-3">
                  {NAV_ITEMS.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`px-4 py-3 text-base font-medium rounded-full transition-all duration-300 block ${isActive(item.href)
                            ? "text-slate-800 bg-black/20 shadow-md"
                            : "text-slate-700 hover:text-slate-900 hover:bg-black/10"
                          }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}