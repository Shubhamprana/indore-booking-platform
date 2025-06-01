"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, Zap, Shield, Calendar, CheckCircle, ArrowRight, Linkedin, Twitter, Mail } from "lucide-react"
import Image from "next/image"
// import Image from "public/servise.png"
import Link from "next/link"

export default function AboutPage() {
  const team = [
    {
      name: "Shubham prajapati",
      role: "Founder & CEO",
      image: "/Shubham.png?height=200&width=200",
      bio: "Former tech executive with 5+ years in booking platforms",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Saurav Sharma",
      role: "CO-founder",
      image: "/placeholder.svg?height=200&width=200",
      bio: "Full-stack developer passionate about scalable solutions",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Amit Patel",
      role: "Head of Product",
      image: "/placeholder.svg?height=200&width=200",
      bio: "UX expert focused on creating seamless user experiences",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Sneha Gupta",
      role: "Head of Marketing",
      image: "/placeholder.svg?height=200&width=200",
      bio: "Growth marketing specialist with startup experience",
      linkedin: "#",
      twitter: "#",
    },
  ]

  const values = [
    {
      icon: Users,
      title: "Customer First",
      description: "Every decision we make puts our users' needs at the center",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We constantly push boundaries to create better solutions",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data and transactions are protected with bank-grade security",
    },
    {
      icon: Heart,
      title: "Community",
      description: "Building strong relationships between customers and businesses",
    },
  ]

  const milestones = [
    { year: "2023", event: "Company Founded", description: "Started with a vision to revolutionize booking" },
    { year: "2024 Q1", event: "Team Expansion", description: "Grew to 12 talented team members" },
    { year: "2024 Q2", event: "Beta Launch", description: "Launched closed beta with 500+ testers" },
    { year: "2024 Q3", event: "Public Launch", description: "Official platform launch planned" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FastBookr</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Pre-Launch
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About FastBookr</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We're on a mission to eliminate waiting and make booking services as simple as a single tap.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            To revolutionize the service booking experience by connecting customers with businesses through a seamless,
            instant booking platform that eliminates waiting times and enhances convenience for everyone.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                FastBookr was born from a simple frustration: waiting in long queues and struggling to book appointments
                with busy service providers. Our founders experienced this pain point repeatedly - from waiting hours at
                restaurants to struggling to book salon appointments.
              </p>
              <p>
                We realized that in today's digital age, there had to be a better way. That's when we decided to create
                a platform that would eliminate waiting times and make booking services as easy as ordering food online.
              </p>
              <p>
                Starting in Indore, we're building a comprehensive platform that serves both customers seeking
                convenience and businesses looking to optimize their operations and reduce no-shows.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Join Our Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/servise.png"
              alt="Our Story"
              width={500}
              height={400}
              priority
              style={{ height: "auto" }}
              className="rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people building the future of booking</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    style={{ height: "auto" }}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href={member.linkedin} className="text-gray-400 hover:text-blue-600">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href={member.twitter} className="text-gray-400 hover:text-blue-600">
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our growth story</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transform md:-translate-x-1/2"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-center">
                  <div className="absolute left-0 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transform md:-translate-x-1/2 z-10">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8 md:ml-auto"}`}>
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <Badge className="mb-3">{milestone.year}</Badge>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.event}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 md:p-12 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Impact So Far</h2>
            <p className="text-blue-100">Even before launch, we're making waves</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">15,000+</div>
              <div className="text-blue-100">Pre-registered Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">2,000+</div>
              <div className="text-blue-100">Interested Businesses</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities Interested</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Beta Testers</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Us?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of the booking revolution. Join thousands of early adopters waiting for launch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Join Pre-Launch
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
