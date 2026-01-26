'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const testimonials = [
  {
    id: 1,
    name: 'Samantha Perera',
    role: 'Managing Director',
    company: 'Lanka Exports Pvt Ltd',
    image: null,
    rating: 5,
    text: 'APEX has been our IT partner for over 5 years. Their response time is incredible - we had a server issue at 7 AM and they had a technician on-site within 2 hours. Highly recommend their comprehensive service agreement!',
  },
  {
    id: 2,
    name: 'Ranjith Fernando',
    role: 'IT Manager',
    company: 'Ceylon Traders',
    image: null,
    rating: 5,
    text: 'We purchased 50 workstations from APEX for our new office. The prices were competitive and the after-sales support has been exceptional. Their team helped us with the complete setup and network configuration.',
  },
  {
    id: 3,
    name: 'Niluka Silva',
    role: 'Operations Head',
    company: 'Express Logistics',
    image: null,
    rating: 5,
    text: 'The service agreement with APEX has saved us countless hours of downtime. Their preventive maintenance approach keeps our systems running smoothly. Best IT service provider in Colombo!',
  },
  {
    id: 4,
    name: 'Ashan Jayawardena',
    role: 'Finance Director',
    company: 'Prime Investments',
    image: null,
    rating: 5,
    text: 'Quality products at fair prices with genuine warranty. APEX helped us upgrade our entire office infrastructure. Their technical knowledge and customer service are top-notch.',
  },
  {
    id: 5,
    name: 'Dilini Wickramasinghe',
    role: 'CEO',
    company: 'Digital Solutions Lanka',
    image: null,
    rating: 5,
    text: 'As a software company, we need reliable hardware partners. APEX delivers every time - from laptops to servers, they have it all. Their technical team understands our requirements perfectly.',
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Customer Reviews
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it - hear from our satisfied customers
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <Card className="relative p-8 sm:p-12 bg-card/50 backdrop-blur-sm border-primary/10">
            {/* Quote Icon */}
            <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/10" />

            <div className="relative">
              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < currentTestimonial.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-center text-lg sm:text-xl leading-relaxed text-foreground mb-8">
                &ldquo;{currentTestimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {currentTestimonial.name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{currentTestimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.role}
                  </div>
                  <div className="text-sm text-primary font-medium">
                    {currentTestimonial.company}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:-left-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={goToPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:-right-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                }`}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto px-4 sm:px-0">
          {[
            { value: '500+', label: 'Happy Clients' },
            { value: '10+', label: 'Years Experience' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '24/7', label: 'Support Available' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
