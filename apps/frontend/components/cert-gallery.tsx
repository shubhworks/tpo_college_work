"use client"

import { FileText, Eye, Download, X } from "lucide-react"
import type { Certificate } from "@/types/student"
import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CertGalleryProps {
  certificates: Certificate[]
}

export function CertGallery({ certificates }: CertGalleryProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <motion.div
            key={cert.id}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            {/* Visual Preview / Thumbnail */}
            <div
              className="h-32 bg-gray-100 relative cursor-pointer flex items-center justify-center overflow-hidden"
              onClick={() => setSelectedCert(cert)}
            >
              {cert.thumbnailLink ? (
                <Image
                  src={cert.thumbnailLink || "/placeholder.svg"}
                  alt={cert.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <FileText className="w-10 h-10 text-gray-300" />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  Preview
                </span>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={cert.name}>
                {cert.name}
              </h4>
              <p className="text-xs text-gray-500 mb-4">{cert.mimeType}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <a
                  href={cert.webContentLink}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Modal - Opens on click */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedCert(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{selectedCert.name}</h3>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center min-h-[400px]">
                {/* Simulated PDF/Image viewer */}
                <div className="bg-white p-8 shadow-sm max-w-full">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="w-24 h-24 text-gray-300" />
                    <p className="text-gray-500">Preview of {selectedCert.name}</p>
                    <p className="text-xs text-gray-400">In a real application, the PDF or Image would render here.</p>
                    <a
                      href={selectedCert.webContentLink}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Open Original File
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
