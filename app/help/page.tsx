"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Users,
  Building,
  CreditCard,
  Settings,
  Shield,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Play,
  Video,
} from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    {
      icon: Users,
      title: "Getting Started",
      description: "Learn the basics of using BookNow",
      articles: 12,
      color: "blue",
    },
    {
      icon: Calendar,
      title: "Booking Management",
      description: "How to create and manage bookings",
      articles: 8,
      color: "green",
    },
    {
      icon: Building,
      title: "Business Features",
      description: "Advanced features for business owners",
      articles: 15,
      color: "purple",
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Payment processing and billing questions",
      articles: 6,
      color: "orange",
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      articles: 10,
      color: "gray",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Keep your account safe and secure",
      articles: 7,
      color: "red",
    },
  ]

  const popularArticles = [
    {
      title: "How to create your first booking",
      category: "Getting Started",
      views: "2.5k views",
      readTime: "3 min read",
    },
    {
      title: "Setting up your business profile",
      category: "Business Features",
      views: "1.8k views",
      readTime: "5 min read",
    },
    {
      title: "Managing payment methods",
      category: "Payments & Billing",
      views: "1.2k views",
      readTime: "4 min read",
    },
    {
      title: "Understanding referral rewards",
      category: "Getting Started",
      views: "980 views",
      readTime: "2 min read",
    },
    {
      title: "Mobile app features guide",
      category: "Getting Started",
      views: "756 views",
      readTime: "6 min read",
    },
  ]

  const videoTutorials = [
    {
      title: "BookNow Overview - Getting Started",
      duration: "5:30",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Getting Started",
    },
    {
      title: "Setting Up Your Business Profile",
      duration: "8:45",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Business Features",
    },
    {
      title: "Managing Bookings Like a Pro",
      duration: "12:20",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Booking Management",
    },
    {
      title: "Payment Setup and Configuration",
      duration: "6:15",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Payments & Billing",
    },
  ]

  const faqs = [
    {
      question: "How do I cancel or reschedule a booking?",
      answer:
        "You can cancel or reschedule bookings up to 24 hours before the appointment time through your dashboard or mobile app. Go to 'My Bookings' and select the booking you want to modify.",
      category: "Booking Management",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. Payments are processed securely through our encrypted payment gateway.",
      category: "Payments & Billing",
    },
    {
      question: "How do I earn referral rewards?",
      answer:
        "Share your unique referral code with friends. When they sign up and make their first booking, you'll both receive ₹500 in credits. There's no limit to how many friends you can refer!",
      category: "Getting Started",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we use bank-grade encryption to protect your data. We never share your personal information with third parties without your consent. Read our Privacy Policy for more details.",
      category: "Security & Privacy",
    },
    {
      question: "Can I use BookNow for my business?",
      answer:
        "BookNow offers comprehensive business solutions. You can manage appointments, track analytics, process payments, and much more. Sign up for a business account to get started.",
      category: "Business Features",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our support team 24/7 through live chat, email (support@booknow.com), or phone (+91 98765 43210). We typically respond within 2 hours during business hours.",
      category: "Getting Started",
    },
  ]

  const contactOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7 Available",
      action: "Start Chat",
      color: "blue",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 4 hours",
      action: "Send Email",
      color: "green",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Fri 9AM-6PM",
      action: "Call Now",
      color: "purple",
    },
    {
      icon: Book,
      title: "Knowledge Base",
      description: "Browse our comprehensive guides",
      availability: "Always Available",
      action: "Browse Articles",
      color: "orange",
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
                Help Center
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find answers to your questions, learn how to use BookNow, and get the support you need.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for help articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white/40 rounded-xl"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 hover:bg-gray-100">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="browse" className="space-y-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Topics</TabsTrigger>
            <TabsTrigger value="popular">Popular Articles</TabsTrigger>
            <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          {/* Browse Topics Tab */}
          <TabsContent value="browse" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Help Topics</h2>
              <p className="text-xl text-gray-600">Find answers organized by category</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          category.color === "blue"
                            ? "bg-blue-100"
                            : category.color === "green"
                              ? "bg-green-100"
                              : category.color === "purple"
                                ? "bg-purple-100"
                                : category.color === "orange"
                                  ? "bg-orange-100"
                                  : category.color === "gray"
                                    ? "bg-gray-100"
                                    : "bg-red-100"
                        }`}
                      >
                        <category.icon
                          className={`w-6 h-6 ${
                            category.color === "blue"
                              ? "text-blue-600"
                              : category.color === "green"
                                ? "text-green-600"
                                : category.color === "purple"
                                  ? "text-purple-600"
                                  : category.color === "orange"
                                    ? "text-orange-600"
                                    : category.color === "gray"
                                      ? "text-gray-600"
                                      : "text-red-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{category.articles} articles</Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h3>
                  <p className="text-gray-600">Jump to the most requested help topics</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Smartphone className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Mobile App</div>
                      <div className="text-xs text-gray-500">Download & setup</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <CreditCard className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Payment Issues</div>
                      <div className="text-xs text-gray-500">Billing & refunds</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Calendar className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Booking Help</div>
                      <div className="text-xs text-gray-500">Create & manage</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Building className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Business Setup</div>
                      <div className="text-xs text-gray-500">Get started guide</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Popular Articles Tab */}
          <TabsContent value="popular" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Articles</h2>
              <p className="text-xl text-gray-600">Most viewed help articles this month</p>
            </div>

            <div className="space-y-6">
              {popularArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <Badge variant="outline">{article.category}</Badge>
                          <span>{article.views}</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <p className="text-gray-600">Quick answers to common questions</p>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                          <p className="text-gray-600 mb-3">{faq.answer}</p>
                          <Badge variant="secondary">{faq.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Video Tutorials Tab */}
          <TabsContent value="videos" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Tutorials</h2>
              <p className="text-xl text-gray-600">Learn with step-by-step video guides</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {videoTutorials.map((video, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h3>
                      <Badge variant="outline">{video.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg">
                <Video className="w-4 h-4 mr-2" />
                View All Tutorials
              </Button>
            </div>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Support</h2>
              <p className="text-xl text-gray-600">Get personalized help from our support team</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {contactOptions.map((option, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          option.color === "blue"
                            ? "bg-blue-100"
                            : option.color === "green"
                              ? "bg-green-100"
                              : option.color === "purple"
                                ? "bg-purple-100"
                                : "bg-orange-100"
                        }`}
                      >
                        <option.icon
                          className={`w-6 h-6 ${
                            option.color === "blue"
                              ? "text-blue-600"
                              : option.color === "green"
                                ? "text-green-600"
                                : option.color === "purple"
                                  ? "text-purple-600"
                                  : "text-orange-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                        <p className="text-gray-600 mb-3">{option.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{option.availability}</Badge>
                          <Button size="sm">
                            {option.action}
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Contact */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Need Urgent Help?</h3>
                <p className="text-red-700 mb-4">For critical issues that need immediate attention</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Hotline
                  </Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                    <Mail className="w-4 h-4 mr-2" />
                    urgent@booknow.com
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-6">
                  Connect with other BookNow users, share tips, and get help from the community
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    User Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
