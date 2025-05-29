"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Shield, Eye, Lock, Users, Database, Globe, Mail, ArrowLeft, Download, Settings, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal Information: Name, email address, phone number, date of birth, and profile photo when you create an account",
        "Booking Data: Service preferences, booking history, payment information, and transaction records",
        "Usage Information: Device type, IP address, browser information, pages visited, and time spent on our platform",
        "Location Data: Geolocation information (with your explicit consent) to provide location-based services",
        "Communication Data: Messages, reviews, feedback, and support inquiries you send through our platform",
        "Business Information: For business accounts - business name, address, license details, and service offerings",
        "Biometric Data: Optional fingerprint or face recognition data for enhanced security (stored locally on your device)"
      ],
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "Service Delivery: Process bookings, facilitate payments, and connect you with service providers",
        "Platform Improvement: Analyze usage patterns to enhance user experience and develop new features",
        "Communication: Send booking confirmations, updates, promotional offers, and important platform notifications",
        "Personalization: Provide customized recommendations based on your preferences and booking history",
        "Security & Safety: Detect fraud, prevent abuse, and ensure platform security and user safety",
        "Legal Compliance: Meet regulatory requirements, resolve disputes, and enforce our terms of service",
        "Marketing: Send relevant promotional content (only with your consent, and you can opt-out anytime)",
        "Analytics: Generate anonymized insights about platform usage and market trends"
      ],
    },
    {
      title: "Information Sharing & Disclosure",
      icon: Users,
      content: [
        "Service Providers: Share necessary booking details (name, contact, service requirements) with your chosen service providers",
        "Payment Processors: Share payment information with secure, PCI-compliant payment gateways for transaction processing",
        "Business Partners: Share anonymized, aggregated data with trusted partners for analytics and business insights",
        "Legal Requirements: Disclose information when required by law, court order, or to protect rights and safety",
        "Business Transfers: In case of merger, acquisition, or asset sale, user data may be transferred with appropriate notice",
        "Third-Party Services: Limited data sharing with analytics, marketing, and customer support tools (under strict data agreements)",
        "Emergency Situations: Share information to prevent harm, ensure safety, or respond to emergencies",
        "We NEVER sell your personal information to advertisers or data brokers"
      ],
    },
    {
      title: "Data Security & Protection",
      icon: Lock,
      content: [
        "Encryption: All data transmission uses TLS 1.3 encryption; sensitive data is encrypted at rest using AES-256",
        "Access Controls: Multi-factor authentication, role-based access, and regular access reviews for all employees",
        "Infrastructure: Data stored in ISO 27001 certified, geographically distributed data centers with 24/7 monitoring",
        "Security Audits: Regular penetration testing, vulnerability assessments, and third-party security audits",
        "Incident Response: Comprehensive breach detection, response procedures, and notification protocols",
        "Employee Training: Regular security awareness training and strict confidentiality agreements for all staff",
        "Data Minimization: We collect and retain only the minimum data necessary for service delivery",
        "Backup & Recovery: Secure, encrypted backups with tested disaster recovery procedures"
      ],
    },
    {
      title: "Your Privacy Rights",
      icon: Shield,
      content: [
        "Access Right: Request a copy of all personal data we hold about you in a portable format",
        "Correction Right: Update, correct, or complete any inaccurate or incomplete personal information",
        "Deletion Right: Request deletion of your account and associated personal data (subject to legal obligations)",
        "Portability Right: Export your data in a structured, machine-readable format for transfer to other services",
        "Objection Right: Object to processing of your data for marketing purposes or legitimate interests",
        "Restriction Right: Request temporary restriction of data processing in certain circumstances",
        "Consent Withdrawal: Withdraw consent for data processing at any time (where consent is the legal basis)",
        "Complaint Right: Lodge complaints with relevant data protection authorities if you believe your rights are violated"
      ],
    },
    {
      title: "International Data Transfers",
      icon: Globe,
      content: [
        "Global Operations: Data may be processed in India, EU, USA, and other countries where our service providers operate",
        "Adequacy Decisions: We rely on European Commission adequacy decisions where available",
        "Standard Contractual Clauses: Use EU-approved standard contractual clauses for transfers to non-adequate countries",
        "Additional Safeguards: Implement supplementary measures like encryption and access controls for international transfers",
        "Data Localization: For Indian users, primary data processing occurs within India in compliance with local laws",
        "Transfer Impact Assessments: Regular assessments of data transfer risks and implementation of additional protections",
        "Your Consent: Explicit consent obtained for transfers where required by applicable law"
      ],
    },
    {
      title: "Data Retention & Deletion",
      icon: Database,
      content: [
        "Account Data: Retained while your account is active and for 3 years after account closure for legal/business purposes",
        "Booking Records: Transaction history retained for 7 years as required by financial regulations and tax laws",
        "Communication Data: Support conversations and messages retained for 2 years for quality assurance",
        "Marketing Data: Promotional preferences and communication history deleted within 30 days of opt-out",
        "Legal Hold: Data may be retained longer if required for ongoing legal proceedings or investigations",
        "Anonymized Analytics: Anonymized usage data may be retained indefinitely for business analytics",
        "Automatic Deletion: Inactive accounts and associated data automatically deleted after 5 years of inactivity",
        "User-Requested Deletion: Account deletion requests processed within 30 days (subject to legal obligations)"
      ],
    }
  ]

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

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
              Your privacy is our priority. We are committed to transparent, secure, and responsible data practices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-blue-100">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                GDPR & CCPA Compliant
              </span>
              <span className="hidden sm:block">•</span>
              <span>Last updated: {currentDate}</span>
              <span className="hidden sm:block">•</span>
              <span>Effective: Upon acceptance</span>
            </div>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-green-50 border-green-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-2">Download Your Data</h3>
              <p className="text-sm text-green-700 mb-3">Export all your personal data in a portable format</p>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                Request Data Export
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <Settings className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-2">Privacy Settings</h3>
              <p className="text-sm text-blue-700 mb-3">Manage your privacy preferences and data sharing</p>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Manage Settings
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-2">Contact DPO</h3>
              <p className="text-sm text-purple-700 mb-3">Reach our Data Protection Officer for privacy questions</p>
              <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                Contact DPO
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Introduction */}
        <Card className="mb-12 border-2 border-blue-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              Our Privacy Commitment
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BookNow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and ensuring the security of your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our booking platform, mobile application, and related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We operate under the principles of data minimization, purpose limitation, transparency, and user control. 
              Your personal data is processed lawfully, fairly, and in a transparent manner, and we implement appropriate 
              technical and organizational measures to ensure a level of security appropriate to the risk.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-900 font-medium">
                By using BookNow, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <section.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cookies & Tracking */}
        <Card className="mt-12">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Database className="w-5 h-5 text-orange-600" />
              </div>
              Cookies & Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-6">
              We use cookies, web beacons, and similar technologies to enhance your experience, provide functionality, 
              and analyze platform usage. You can control cookie preferences through your browser settings.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Essential Cookies
                </h4>
                <p className="text-green-700 text-sm mb-2">
                  Required for basic platform functionality, security, and user authentication. Cannot be disabled.
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Always Active</Badge>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Analytics Cookies
                </h4>
                <p className="text-blue-700 text-sm mb-2">
                  Help us understand platform usage, identify popular features, and improve user experience.
                </p>
                <Badge variant="outline" className="border-blue-300 text-blue-700">Optional</Badge>
              </div>
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Marketing Cookies
                </h4>
                <p className="text-purple-700 text-sm mb-2">
                  Used to deliver relevant advertisements and measure marketing campaign effectiveness.
                </p>
                <Badge variant="outline" className="border-purple-300 text-purple-700">Optional</Badge>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Preference Cookies
                </h4>
                <p className="text-gray-700 text-sm mb-2">
                  Remember your settings and preferences for a personalized, consistent experience.
                </p>
                <Badge variant="outline" className="border-gray-300 text-gray-700">Optional</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mt-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              Children's Privacy Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Age Restriction Notice</h4>
                  <p className="text-yellow-800 text-sm">
                    BookNow is intended for users aged 18 and above. We do not knowingly collect personal information 
                    from children under 18 years of age.
                  </p>
                </div>
              </div>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>If we discover that a child under 18 has provided personal information, we will delete it immediately</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Parents or guardians can contact us to request deletion of their child&apos;s information</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>We encourage parents to monitor their children&apos;s internet usage and educate them about online privacy</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Questions About Your Privacy?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h3>
                <p className="text-gray-700 text-sm mb-3">
                  For privacy questions, data requests, or concerns about your personal information
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> privacy@booknow.com</p>
                  <p><strong>Phone:</strong> +91 1800-PRIVACY</p>
                  <p><strong>Response Time:</strong> 48 hours</p>
                </div>
              </div>
              <div className="text-center">
                <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Controls</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Manage your privacy settings, data sharing preferences, and communication options
                </p>
                <Link href="/profile?tab=privacy">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Manage Privacy Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-lg p-6">
            <p className="text-gray-600 text-sm mb-4">
              This Privacy Policy may be updated periodically. We will notify you of significant changes via email 
              and platform notifications. Continued use of our service after updates constitutes acceptance of the revised policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/terms">
                <Button variant="outline">Terms of Service</Button>
              </Link>
              <Link href="/contact?subject=privacy">
                <Button variant="outline">Contact Legal Team</Button>
              </Link>
              <Link href="/profile?tab=privacy">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Privacy Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
