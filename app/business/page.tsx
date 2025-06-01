"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Star,
  Shield,
  CheckCircle,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Smartphone,
  CreditCard,
  Globe,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BusinessPage() {
  const [businessType, setBusinessType] = useState("")

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Boost bookings by 40% with our smart scheduling system",
      stat: "40% more bookings",
    },
    {
      icon: Users,
      title: "Reduce No-Shows",
      description: "Cut no-shows by 60% with automated reminders and confirmations",
      stat: "60% fewer no-shows",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Automate booking management and free up 5+ hours daily",
      stat: "5+ hours saved daily",
    },
    {
      icon: Star,
      title: "Better Reviews",
      description: "Improve customer satisfaction with seamless booking experience",
      stat: "4.8+ star ratings",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Get insights into peak hours, customer preferences, and trends",
      stat: "Real-time insights",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Accept payments securely with multiple payment options",
      stat: "Bank-grade security",
    },
  ]

  const features = [
    {
      category: "Booking Management",
      items: [
        "Real-time availability calendar",
        "Automated booking confirmations",
        "Smart scheduling optimization",
        "Waitlist management",
        "Recurring appointment setup",
      ],
    },
    {
      category: "Customer Communication",
      items: [
        "Automated SMS & email reminders",
        "Two-way messaging system",
        "Customer feedback collection",
        "Review management tools",
        "Loyalty program integration",
      ],
    },
    {
      category: "Business Analytics",
      items: [
        "Revenue tracking dashboard",
        "Customer behavior insights",
        "Peak hours analysis",
        "Staff performance metrics",
        "Custom reporting tools",
      ],
    },
    {
      category: "Payment & Billing",
      items: [
        "Multiple payment gateways",
        "Automated invoicing",
        "Subscription management",
        "Refund processing",
        "Financial reporting",
      ],
    },
  ]

  const businessTypes = [
    {
      type: "Restaurant",
      icon: "🍽️",
      description: "Table reservations, takeaway orders, event bookings",
      features: ["Table management", "Menu integration", "Order tracking"],
    },
    {
      type: "Salon & Spa",
      icon: "💇",
      description: "Appointment scheduling, service packages, staff management",
      features: ["Service catalog", "Staff scheduling", "Package deals"],
    },
    {
      type: "Healthcare",
      icon: "🏥",
      description: "Patient appointments, consultation booking, health records",
      features: ["Patient management", "Medical records", "Insurance integration"],
    },
    {
      type: "Fitness",
      icon: "💪",
      description: "Class bookings, personal training, membership management",
      features: ["Class schedules", "Trainer booking", "Membership tracking"],
    },
    {
      type: "Automotive",
      icon: "🚗",
      description: "Service appointments, maintenance scheduling, pickup/delivery",
      features: ["Service tracking", "Parts inventory", "Customer history"],
    },
    {
      type: "Education",
      icon: "📚",
      description: "Course enrollment, tutoring sessions, workshop bookings",
      features: ["Course management", "Student tracking", "Progress reports"],
    },
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      business: "Kumar's Restaurant",
      type: "Restaurant",
      quote:
        "BookNow helped us increase our table turnover by 35%. The automated reminders reduced no-shows significantly.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      business: "Glamour Salon",
      type: "Salon",
      quote: "Managing appointments is so much easier now. Our customers love the convenience of online booking.",
      rating: 5,
    },
    {
      name: "Dr. Amit Patel",
      business: "City Care Clinic",
      type: "Healthcare",
      quote:
        "The patient management features are excellent. We've reduced waiting times and improved patient satisfaction.",
      rating: 5,
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
                For Business
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Grow Your Business with BookNow</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses using BookNow to streamline bookings, reduce no-shows, and increase revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?type=business">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="benefits" className="space-y-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
            <TabsTrigger value="testimonials">Success Stories</TabsTrigger>
          </TabsList>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BookNow for Your Business?</h2>
              <p className="text-xl text-gray-600">Proven results that drive growth and customer satisfaction</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 mb-4">{benefit.description}</p>
                    <Badge className="bg-green-100 text-green-800">{benefit.stat}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ROI Calculator */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Calculate Your Potential ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                    <div className="text-gray-700">More Bookings</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
                    <div className="text-gray-700">Fewer No-Shows</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">5+</div>
                    <div className="text-gray-700">Hours Saved Daily</div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <p className="text-gray-600 mb-4">
                    Average business sees <strong>₹50,000+ additional revenue</strong> per month
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">Calculate My ROI</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Business Management Suite</h2>
              <p className="text-xl text-gray-600">Everything you need to run your business efficiently</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      {feature.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile-First Design</h3>
                  <p className="text-gray-600">Optimized for mobile devices with native iOS and Android apps</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Location Support</h3>
                  <p className="text-gray-600">Manage multiple business locations from a single dashboard</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrated Payments</h3>
                  <p className="text-gray-600">Accept payments online with multiple gateway options</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Every Industry</h2>
              <p className="text-xl text-gray-600">Customized solutions for different business types</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessTypes.map((business, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    businessType === business.type ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setBusinessType(business.type)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{business.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{business.type}</h3>
                    <p className="text-gray-600 mb-4">{business.description}</p>
                    <div className="space-y-2">
                      {business.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="secondary" className="mr-2">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Industry-Specific Benefits */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry-Specific Solutions</h3>
                  <p className="text-gray-600">We understand the unique needs of your business</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Service-Based Businesses</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Staff scheduling and availability management</li>
                      <li>• Service duration and pricing customization</li>
                      <li>• Customer history and preferences tracking</li>
                      <li>• Automated follow-up and feedback collection</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Hospitality Businesses</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Table/room availability and reservations</li>
                      <li>• Group booking and event management</li>
                      <li>• Menu/service catalog integration</li>
                      <li>• Special occasion and loyalty programs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">See how businesses like yours are thriving with BookNow</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-blue-600">{testimonial.business}</div>
                      <Badge variant="secondary" className="mt-2">
                        {testimonial.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Case Study */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge className="bg-green-100 text-green-800 mb-4">Case Study</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Kumar's Restaurant Chain</h3>
                    <p className="text-gray-700 mb-6">
                      A family restaurant chain with 5 locations increased their revenue by 45% and reduced no-shows by
                      70% within 3 months of using BookNow.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">45%</div>
                        <div className="text-sm text-gray-600">Revenue Increase</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">70%</div>
                        <div className="text-sm text-gray-600">Fewer No-Shows</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">4.9</div>
                        <div className="text-sm text-gray-600">Customer Rating</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Kumar's Restaurant"
                      width={400}
                      height={300}
                      style={{ height: "auto" }}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pricing Preview */}
        <Card className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              No setup fees, no monthly charges. Pay only when you earn - we succeed when you succeed.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-4">Free</div>
                <p className="text-blue-100 mb-4">Perfect for small businesses</p>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Up to 50 bookings/month</li>
                  <li>• Basic calendar management</li>
                  <li>• Email notifications</li>
                  <li>• Customer database</li>
                </ul>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border-2 border-white/30">
                <Badge className="bg-orange-500 text-white mb-2">Most Popular</Badge>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold mb-4">3% per booking</div>
                <p className="text-blue-100 mb-4">For growing businesses</p>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Unlimited bookings</li>
                  <li>• Advanced analytics</li>
                  <li>• SMS notifications</li>
                  <li>• Payment processing</li>
                  <li>• Multi-location support</li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-4">Custom</div>
                <p className="text-blue-100 mb-4">For large businesses</p>
                <ul className="text-left space-y-2 text-blue-100">
                  <li>• Everything in Professional</li>
                  <li>• Custom integrations</li>
                  <li>• Dedicated support</li>
                  <li>• White-label options</li>
                  <li>• API access</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?type=business">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about BookNow for Business</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">How quickly can I get started?</h3>
                <p className="text-gray-600">
                  You can set up your business profile and start accepting bookings within 15 minutes. Our onboarding
                  team will help you get everything configured perfectly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Do I need technical knowledge?</h3>
                <p className="text-gray-600">
                  Not at all! BookNow is designed to be user-friendly. If you can use a smartphone, you can use BookNow.
                  Plus, we provide free training and support.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Can I integrate with my existing systems?</h3>
                <p className="text-gray-600">
                  Yes! We offer integrations with popular POS systems, accounting software, and marketing tools. Custom
                  integrations are available for Enterprise customers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">What if I need help?</h3>
                <p className="text-gray-600">
                  We provide 24/7 customer support via chat, email, and phone. Plus, you'll have access to our
                  comprehensive help center and video tutorials.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
