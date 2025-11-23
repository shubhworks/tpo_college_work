import { Footer } from "@/components/footer"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/Navbar"

export default function TPCellPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-slate-50 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">Training & Placement Cell</h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">Bridging the gap between industry and academia</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About T&P Cell</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The Training and Placement Cell at Gyan Ganga Group of Institutions is a dedicated body that facilitates
                training and placement activities for the students. We are committed to providing the best opportunities
                for our students to launch their careers.
              </p>
              <p>
                Our team works tirelessly to maintain strong relationships with industry leaders and recruit top talent.
                We organize regular workshops, seminars, and mock interviews to prepare our students for the corporate
                world.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                "Industry-Academia Interface",
                "Soft Skills Training",
                "Mock Interviews & Aptitude Tests",
                "Internship Support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/placeholder.svg?height=800&width=600&text=Placement+Office"
              alt="T&P Office"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Placement Stats/Logos */}
        <div className="border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Our Top Recruiters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="flex items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-12 bg-gray-200 rounded animate-pulse" />
                {/* Replace with actual logos in production */}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
