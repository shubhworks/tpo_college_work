import { Footer } from "@/components/footer"
import { Navbar } from "@/components/Navbar"
import { Mail, Phone, MapPin, User } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-15">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">Contact T&P Cell</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Mr. Rajeev Sethi</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>tpo@ggits.org</span>
              </div>
            </div>
          </div>

          {/* Contact Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Mr. Vikash Thakur</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>+91 98765 43211</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>tpo@ggits.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-2xl border border-gray-200">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-gray-100 rounded-xl hidden md:block">
              <MapPin className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Our Office</h3>
              <p className="text-gray-600 mb-4">
                Training & Placement Cell, Administrative Block,
                <br />
                Gyan Ganga Group of Institutions,
                <br />
                P.O. Tilwara Ghat, Garha, Jabalpur - 482003 (M.P.)
              </p>
              <div className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden relative">
                {/* Placeholder for map */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Google Maps Embed Would Go Here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
