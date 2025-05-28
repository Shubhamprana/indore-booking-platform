"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Shield, Users, AlertTriangle, Scale, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using BookNow's services, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms apply to all visitors, users, and others who access or use the service.",
      ],
    },
    {
      icon: Users,
      title: "User Responsibilities",
      content: [
        "You are responsible for maintaining the confidentiality of your account and password.",
        "You agree to accept responsibility for all activities that occur under your account or password.",
        "You must provide accurate, current, and complete information during registration.",
        "You must promptly update your account information to keep it accurate and current.",
      ],
    },
    {
      icon: Shield,
      title: "Service Availability",
      content: [
        "BookNow is currently in pre-launch phase. Services described are planned features.",
        "We reserve the right to modify, suspend, or discontinue any part of our service at any time.",
        "We do not guarantee that our service will be available at all times or without interruption.",
        "Beta testing and early access features may have limited functionality.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        "You may not use our service for any illegal or unauthorized purpose.",
        "You may not transmit any worms, viruses, or any code of a destructive nature.",
        "You may not attempt to gain unauthorized access to our systems or networks.",
        "You may not use our service to spam, harass, or abuse other users.",
        "You may not create multiple accounts to circumvent our policies.",
      ],
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: [
        "BookNow shall not be liable for any indirect, incidental, special, consequential, or punitive damages.",
        "Our total liability shall not exceed the amount paid by you for our services in the past 12 months.",
        "We provide our service 'as is' without any warranties, express or implied.",
        "We do not warrant that our service will meet your specific requirements.",
      ],
    },
    {
      icon: Mail,
      title: "Contact and Dispute Resolution",
      content: [
        "For any questions about these Terms of Service, please contact us at legal@booknow.com.",
        "Any disputes will be resolved through binding arbitration in accordance with Indian law.",
        "These terms are governed by the laws of India without regard to conflict of law provisions.",
        "If any provision of these terms is found to be unenforceable, the remaining provisions will remain in effect.",
      ],
    },
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
              <span className="text-xl font-bold">BookNow</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Legal
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
            <div className="text-sm text-blue-200">Last updated: January 2024 | Effective: Upon registration</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Welcome to BookNow</h2>
            <p className="text-blue-800 leading-relaxed">
              These Terms of Service ("Terms") govern your use of BookNow's website, mobile application, and services
              (collectively, the "Service") operated by BookNow ("us", "we", or "our"). By accessing or using our
              Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may
              not access the Service.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-700 leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Pre-Launch Terms</h3>
              <p className="text-green-800 text-sm">
                During our pre-launch phase, these terms may be updated as we refine our services. We will notify all
                registered users of any significant changes via email.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Questions?</h3>
              <p className="text-orange-800 text-sm mb-3">
                If you have any questions about these Terms of Service, please contact our legal team.
              </p>
              <div className="text-sm text-orange-700">
                <p>Email: legal@booknow.com</p>
                <p>Phone: +91 98765 43210</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-lg p-6">
            <p className="text-gray-600 text-sm">
              By continuing to use BookNow, you acknowledge that you have read, understood, and agree to be bound by
              these Terms of Service.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy">
                <Button variant="outline">Privacy Policy</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Legal Team</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  I Agree - Continue Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
