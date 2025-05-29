"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, FileText, Shield, Users, AlertTriangle, Scale, Mail, ArrowLeft, 
  Building, CreditCard, Clock, Eye, Lock, Globe, Ban, Gavel, Phone, BookOpen 
} from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing, browsing, or using BookNow's website, mobile application, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
        "These terms constitute a legally binding agreement between you and BookNow. If you do not agree to these terms, you must not use our services.",
        "Your continued use of our services after any modifications to these terms constitutes acceptance of the updated terms.",
        "You must be at least 18 years old and legally capable of entering into binding contracts to use our services.",
        "By creating an account, you confirm that all information provided is accurate, complete, and current."
      ],
    },
    {
      icon: Users,
      title: "User Accounts & Responsibilities",
      content: [
        "Account Security: You are solely responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
        "Accurate Information: You must provide accurate, current, and complete information during registration and promptly update any changes.",
        "Single Account Policy: Each user may maintain only one active account. Multiple accounts for the same individual are prohibited.",
        "Account Termination: You may deactivate your account at any time. We reserve the right to suspend or terminate accounts that violate these terms.",
        "Notification Obligations: You must immediately notify us of any unauthorized use of your account or any security breaches.",
        "Age Verification: You represent that you are at least 18 years old and have the legal capacity to enter into this agreement.",
        "Business Accounts: Business users must provide valid business credentials and comply with additional business terms."
      ],
    },
    {
      icon: Building,
      title: "Service Description & Availability",
      content: [
        "Platform Purpose: BookNow is a digital marketplace connecting users with local service providers for booking appointments and services.",
        "Pre-Launch Phase: BookNow is currently in pre-launch development. Described features represent planned functionality that may change.",
        "Service Modifications: We reserve the right to modify, suspend, discontinue, or restrict access to any part of our services at any time without prior notice.",
        "Geographic Limitations: Services may not be available in all geographic locations. Availability is subject to local regulations and business partnerships.",
        "Third-Party Services: We facilitate connections with independent service providers but are not responsible for the quality, delivery, or outcomes of their services.",
        "Beta Features: Early access and beta features may have limited functionality, potential bugs, and are provided on an 'as-is' basis.",
        "Service Interruptions: We do not guarantee uninterrupted service availability and are not liable for temporary service disruptions."
      ],
    },
    {
      icon: CreditCard,
      title: "Booking & Payment Terms",
      content: [
        "Booking Process: All bookings are subject to service provider availability and confirmation. Bookings are not guaranteed until confirmed.",
        "Payment Processing: Payments are processed through secure, third-party payment processors. We do not store complete payment information.",
        "Pricing: All prices are displayed in Indian Rupees (INR) unless otherwise specified. Prices may vary by location and service provider.",
        "Payment Authorization: By making a booking, you authorize us to charge your selected payment method for the full amount.",
        "Cancellation Policy: Cancellation terms vary by service provider. Refunds are subject to individual service provider policies.",
        "Service Fees: BookNow may charge platform fees, booking fees, or processing fees as disclosed during the booking process.",
        "Disputed Transactions: Payment disputes must be reported within 60 days of the transaction date for investigation."
      ],
    },
    {
      icon: Ban,
      title: "Prohibited Activities & Conduct",
      content: [
        "Illegal Activities: You may not use our platform for any illegal, fraudulent, or unauthorized purposes or in violation of any applicable laws.",
        "System Interference: Prohibited activities include hacking, introducing malware, or attempting to gain unauthorized access to our systems.",
        "Content Violations: Users may not post, share, or transmit content that is offensive, defamatory, discriminatory, or violates intellectual property rights.",
        "Spam & Harassment: Sending unsolicited communications, harassment, or abuse of other users or service providers is strictly prohibited.",
        "Fake Accounts: Creating false accounts, impersonating others, or providing misleading information is not allowed.",
        "Commercial Misuse: Using the platform for unauthorized commercial purposes, reselling services, or competing business activities is prohibited.",
        "Review Manipulation: Posting fake reviews, manipulating ratings, or engaging in review fraud violates our terms.",
        "Data Mining: Automated data collection, scraping, or mining of platform content is strictly prohibited without written permission."
      ],
    },
    {
      icon: Shield,
      title: "Intellectual Property Rights",
      content: [
        "Platform Ownership: BookNow owns all rights, title, and interest in the platform, including software, design, content, and trademarks.",
        "User Content License: By posting content, you grant BookNow a worldwide, non-exclusive, royalty-free license to use, modify, and display your content.",
        "Trademark Protection: BookNow, our logo, and related marks are protected trademarks. Unauthorized use is prohibited.",
        "Copyright Compliance: Users must respect copyright laws and obtain necessary permissions before sharing copyrighted content.",
        "DMCA Policy: We comply with the Digital Millennium Copyright Act and will respond to valid takedown notices.",
        "User-Generated Content: You retain ownership of your original content but are responsible for ensuring you have rights to share it.",
        "Third-Party Content: Our platform may include content from third parties, which remains subject to their respective intellectual property rights."
      ],
    },
    {
      icon: Scale,
      title: "Limitation of Liability & Disclaimers",
      content: [
        "Service 'As-Is': Our services are provided on an 'as-is' and 'as-available' basis without warranties of any kind, express or implied.",
        "No Warranties: We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement.",
        "Limitation of Damages: Our total liability shall not exceed the amount paid by you to BookNow in the 12 months preceding the claim.",
        "Excluded Damages: We are not liable for indirect, incidental, special, consequential, or punitive damages under any circumstances.",
        "Third-Party Services: We are not responsible for the actions, quality, or delivery of services provided by third-party service providers.",
        "Force Majeure: We are not liable for delays or failures due to circumstances beyond our reasonable control.",
        "User Responsibility: Users acknowledge that they use the platform at their own risk and are responsible for their interactions with service providers."
      ],
    },
    {
      icon: Eye,
      title: "Privacy & Data Protection",
      content: [
        "Privacy Policy: Our collection, use, and protection of personal information is governed by our Privacy Policy, incorporated by reference.",
        "Data Processing: By using our services, you consent to the processing of your data in accordance with our Privacy Policy.",
        "International Transfers: Your data may be processed in countries outside India where our service providers operate.",
        "Data Security: We implement appropriate security measures to protect your personal information from unauthorized access.",
        "User Rights: You have rights regarding your personal data as described in our Privacy Policy and applicable data protection laws.",
        "Data Retention: We retain your data only as long as necessary for providing services and complying with legal obligations.",
        "Third-Party Sharing: We may share your data with service providers and partners as described in our Privacy Policy."
      ],
    },
    {
      icon: Gavel,
      title: "Dispute Resolution & Governing Law",
      content: [
        "Governing Law: These terms are governed by the laws of India without regard to conflict of law principles.",
        "Jurisdiction: Any disputes shall be resolved in the courts of Indore, Madhya Pradesh, India.",
        "Arbitration: Disputes may be subject to binding arbitration as per the Arbitration and Conciliation Act, 2015.",
        "Informal Resolution: We encourage users to contact us first to resolve disputes informally before pursuing legal action.",
        "Class Action Waiver: You agree to resolve disputes individually and waive any right to participate in class action lawsuits.",
        "Limitation Period: Any claims must be filed within one year of the cause of action arising.",
        "Legal Fees: In case of disputes, the prevailing party may be entitled to recover reasonable legal fees and costs."
      ],
    },
    {
      icon: Clock,
      title: "Term Modifications & Termination",
      content: [
        "Terms Updates: We may modify these terms at any time. Significant changes will be communicated via email and platform notifications.",
        "Continued Use: Your continued use of our services after term modifications constitutes acceptance of the updated terms.",
        "Account Termination: We may suspend or terminate your account for violations of these terms or for any other reason at our discretion.",
        "Effect of Termination: Upon termination, your right to use our services ceases immediately, but these terms continue to apply to past usage.",
        "Data After Termination: We may retain your data for legal obligations and may delete account data as described in our Privacy Policy.",
        "Survival: Provisions relating to intellectual property, liability, disputes, and governing law survive termination of these terms."
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
                Terms of Service
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              These terms govern your use of BookNow. Please read them carefully before using our platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-blue-100">
              <span className="flex items-center">
                <Scale className="w-4 h-4 mr-2" />
                Legally Binding Agreement
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

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Quick Summary</h3>
              <p className="text-xs text-blue-700">Key points overview</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Your Rights</h3>
              <p className="text-xs text-green-700">User rights & protections</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-900 mb-1">Prohibited</h3>
              <p className="text-xs text-orange-700">What's not allowed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Contact</h3>
              <p className="text-xs text-purple-700">Legal team support</p>
            </CardContent>
          </Card>
        </div>

        {/* Introduction */}
        <Card className="mb-12 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Gavel className="w-6 h-6 text-blue-600 mr-2" />
              Legal Agreement Overview
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and BookNow 
              Technologies Private Limited (&quot;BookNow&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to and use of 
              our website, mobile application, and services (collectively, the &quot;Platform&quot;).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              BookNow operates as a digital marketplace facilitating connections between users and local service 
              providers. We are committed to providing a safe, reliable, and user-friendly platform while maintaining 
              high standards of service quality and legal compliance.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Important Notice</h4>
                  <p className="text-yellow-800 text-sm">
                    By using BookNow, you agree to these terms in their entirety. If you disagree with any part of 
                    these terms, you must not use our platform. These terms may be updated periodically with notice to users.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-gray-900">{section.title}</span>
                    <div className="text-sm text-gray-500 font-normal mt-1">
                      Section {index + 1} of {sections.length}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
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

        {/* Contact & Support Information */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Legal Support & Contact</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Legal Team</h3>
                <p className="text-gray-700 text-sm mb-3">
                  For questions about these terms, legal compliance, or contract matters
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> legal@booknow.com</p>
                  <p><strong>Phone:</strong> +91 1800-LEGAL-01</p>
                  <p><strong>Response Time:</strong> 72 hours</p>
                  <p><strong>Address:</strong> Indore, Madhya Pradesh, India</p>
                </div>
              </div>
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Report Violations</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Report terms violations, abuse, or suspicious activities on our platform
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-100">
                    Report Violation
                  </Button>
                  <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                    Emergency Issues
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Launch Notice */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Calendar className="w-8 h-8 text-green-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Pre-Launch Terms Notice</h3>
                <p className="text-green-800 text-sm mb-3">
                  BookNow is currently in pre-launch phase. These terms apply to early access users, beta testers, 
                  and waitlist members. Terms may be updated as we refine our services before full launch.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">Early Access</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Beta Testing</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Waitlist Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Terms Updates
              </h3>
              <p className="text-yellow-800 text-sm mb-3">
                We may update these terms to reflect changes in our services, legal requirements, or business practices. 
                Significant changes will be communicated 30 days in advance.
              </p>
              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                Last Updated: {currentDate}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                International Users
              </h3>
              <p className="text-indigo-800 text-sm mb-3">
                While primarily serving Indian markets, international users may access our platform subject to 
                local laws and additional terms that may apply in their jurisdiction.
              </p>
              <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                Governed by Indian Law
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Continue?</h3>
            <p className="text-gray-600 text-sm mb-6">
              By clicking &quot;I Agree&quot; below, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service and our Privacy Policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy">
                <Button variant="outline">Read Privacy Policy</Button>
              </Link>
              <Link href="/contact?subject=legal">
                <Button variant="outline">Contact Legal Team</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  I Agree - Continue Registration
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              These terms are effective upon acceptance and remain in effect while you use our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
