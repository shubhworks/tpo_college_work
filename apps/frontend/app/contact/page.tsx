import Image from "next/image"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/Navbar"
import { Mail, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Contact T&P Cell
          </h1>

          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
            Reach out to the Training & Placement Cell for placement,
            internship, and recruitment related queries.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            {/* Large Image */}
            <div className="relative w-full h-[420px]">
              <Image
                src="/raajeev.jpg"
                alt="Mr. Rajeev Sethi"
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Mr. Rajeev Sethi
              </h2>

              <p className="text-slate-500 mb-8 text-lg">
                Dean - Placement
              </p>

              <div className="space-y-5">
                {/* Phone */}
                <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-slate-700" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-lg font-semibold text-slate-800">
                      +91 90099 91789
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-700" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-lg font-semibold text-slate-800">
                      tpo@ggits.org
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            {/* Large Image */}
            <div className="relative w-full h-[420px]">
              <Image
                src="/vikaash.jpg"
                alt="Mr. Vikash Thakur"
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Mr. Vikash Thakur
              </h2>

              <p className="text-slate-500 mb-8 text-lg">
                Sr. Placement Officer
              </p>

              <div className="space-y-5">
                {/* Phone */}
                <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-slate-700" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-lg font-semibold text-slate-800">
                      +91 90092 67764
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-700" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-lg font-semibold text-slate-800">
                      tpo@ggits.org
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}