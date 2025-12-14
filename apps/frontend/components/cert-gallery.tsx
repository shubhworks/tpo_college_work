"use client"

import { FileText, Eye, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Certificate } from "@/types/student"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// -----------------------------
// Extract FileId from Google Drive URL
// -----------------------------
function extractFileId(url: string = "") {
  if (!url) return ""

  const idMatch = url.match(/id=([^&]+)/)
  if (idMatch) return idMatch[1]

  const fileMatch = url.match(/\/d\/([^/]+)/)
  if (fileMatch) return fileMatch[1]

  return ""
}

// -----------------------------
// Convert Drive URL → /preview URL for iframe embedding
// -----------------------------
function toPreviewURL(url: string = "") {
  const fileId = extractFileId(url)
  if (!fileId) return ""
  return `https://drive.google.com/file/d/${fileId}/preview`
}

export function CertGallery({ certificates }: { certificates: Certificate[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  function openAt(index: number) {
    setSelectedIndex(index)
  }

  function close() {
    setSelectedIndex(null)
  }

  function goPrev() {
    setSelectedIndex((i) => {
      if (i === null) return null
      return i > 0 ? i - 1 : i
    })
  }

  function goNext() {
    setSelectedIndex((i) => {
      if (i === null) return null
      return i < certificates.length - 1 ? i + 1 : i
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selectedIndex === null) return
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "Escape") close()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedIndex])

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No certificates available</p>
      </div>
    )
  }

  return (
    <>
      {/* GRID LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, idx) => {
          const previewURL = toPreviewURL(cert.webContentLink)

          return (
            <motion.div
              key={cert.id}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Thumbnail with Mini Iframe Preview */}
              <div
                className="h-40 bg-gray-100 relative cursor-pointer overflow-hidden"
                onClick={() => openAt(idx)}
              >
                {previewURL ? (
                  <iframe
                    src={previewURL}
                    className="w-full h-full border-0 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    Preview
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex gap-2">
                  {/* Open Modal */}
                  <button
                    type="button"
                    onClick={() => openAt(idx)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* MODAL VIEWER */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => close()}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-end p-4 border-b border-gray-100">
                {/* <h3 className="text-lg font-semibold text-gray-900">{certificates[selectedIndex].name}</h3> */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => close()}
                    className="p-2 text-white bg-red-500 cursor-pointer hover:bg-red-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewer */}
              <div className="flex-1 overflow-auto bg-gray-200 p-3 relative flex items-center justify-center">
                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={selectedIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white"
                  aria-label="Previous certificate"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <iframe
                  src={toPreviewURL(certificates[selectedIndex].webContentLink)}
                  className="w-full h-[80vh] rounded-lg border-0 max-w-full"
                />

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={selectedIndex >= certificates.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white"
                  aria-label="Next certificate"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
