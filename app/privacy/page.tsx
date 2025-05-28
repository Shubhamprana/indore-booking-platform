"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Shield, Eye, Lock, Users, Database, Globe, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal information you provide when creating an account (name, email, phone number)",
        "Booking and transaction history",
        "Device information and usage data",
        "Location data (with your permission)",
        "Communication preferences and feedback",
      ],
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "To provide and improve our booking services",
        "To process transactions and send confirmations",
        "To communicate important updates and notifications",
        "To personalize your experience and recommendations",
        "To prevent fraud and ensure platform security",
      ],
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        "We never sell your personal information to third parties",
        "Service providers receive only necessary booking details",
        "Anonymous analytics data may be shared with partners",
        "Legal compliance may require information disclosure",
        "Business transfers may include user data with consent",
      ],
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        "Bank-grade encryption for all sensitive data",
        "Regular security audits and penetration testing",
        "Secure data centers with 24/7 monitoring",
        "Employee access controls and training",
        "Incident response and breach notification procedures",
      ],
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: [
        "Access and download your personal data",
        "Correct inaccurate or incomplete information",
        "Delete your account and associated data",
        "Opt-out of marketing communications",
        "Data portability to other services",
      ],
    },
    {
      title: "International Transfers",
      icon: Globe,
      content: [
        "Data may be processed in countries outside India",
        "Adequate protection measures are always in place",
        "EU-India adequacy decisions are respected",
        "Standard contractual clauses for data transfers",
        "Your consent is obtained for international processing",
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
                Privacy Policy
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center space-x-4 text-blue-100">
              <span>Last updated: January 15, 2024</span>
              <span>•</span>
              <span>Effective: January 15, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BookNow ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our booking platform and related services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using BookNow, you agree to the collection and use of information in accordance with this policy. If
              you do not agree with our policies and practices, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <section.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cookies Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Database className="w-5 h-5 text-orange-600" />
              </div>
              Cookies and Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our platform:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                <p className="text-gray-600 text-sm">
                  Required for basic platform functionality, security, and user authentication.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                <p className="text-gray-600 text-sm">
                  Help us understand how users interact with our platform to improve services.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                <p className="text-gray-600 text-sm">
                  Used to deliver relevant advertisements and measure campaign effectiveness.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Preference Cookies</h4>
                <p className="text-gray-600 text-sm">
                  Remember your settings and preferences for a personalized experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              BookNow is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us immediately so we can delete such information.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Posting the new Privacy Policy on this page
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Sending you an email notification
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Displaying a prominent notice on our platform
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy
              are effective when they are posted on this page.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices, please don't hesitate to
              contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Data Protection Officer
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Email: privacy@booknow.com</p>
              <p>Address: BookNow Privacy Team, Indore, Madhya Pradesh, India</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
