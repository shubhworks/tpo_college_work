"use client"

import { FileText, Download, Eye } from "lucide-react"
import type { Certificate } from "@/types/student"

interface CertGalleryProps {
  certificates: Certificate[]
}

export function CertGallery({ certificates }: CertGalleryProps) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No certificates available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((cert) => (
        <div key={cert.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{cert.name}</p>
                <p className="text-xs text-gray-500">{cert.mimeType}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={cert.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              aria-label={`View ${cert.name}`}
            >
              <Eye className="w-4 h-4" />
              View
            </a>
            <a
              href={cert.webContentLink}
              download
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              aria-label={`Download ${cert.name}`}
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
