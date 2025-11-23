"use client"

import { Footer } from "@/components/footer"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Navbar } from "../../components/Navbar"

const CAROUSEL_IMAGES = [
  "/placeholder.svg?height=600&width=1200&text=Campus+View",
  "/placeholder.svg?height=600&width=1200&text=Graduation+Ceremony",
  "/placeholder.svg?height=600&width=1200&text=Placement+Drive",
]

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Carousel */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-50 z-10 bg-black" />
        <Image
          src={CAROUSEL_IMAGES[currentSlide] || "/placeholder.svg"}
          alt="About Us Hero"
          fill
          className="object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Gyan Ganga</h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">Excellence in Education Since 1992</p>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrentSlide((c) => (c - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((c) => (c + 1) % CAROUSEL_IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg mx-auto text-gray-600">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Legacy</h2>
          <p>
            Gyan Ganga Group of Institutions (GGGI) is a renowned name in the field of technical education in Central
            India. Established with a vision to provide world-class education, the group has consistently delivered
            excellence through its constituent colleges.
          </p>
          <p>
            The institutions are known for their state-of-the-art infrastructure, highly qualified faculty, and strong
            industry connect. We believe in holistic development of students, fostering not just academic excellence but
            also technical skills and ethical values.
          </p>

          <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
            <div className="bg-blue-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Vision</h3>
              <p className="text-blue-800">
                To be a premier institute of technical education and research, producing globally competent
                professionals.
              </p>
            </div>
            <div className="bg-indigo-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Mission</h3>
              <p className="text-indigo-800">
                To provide quality education through innovative teaching-learning processes and state-of-the-art
                facilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
