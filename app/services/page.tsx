"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  Utensils,
  Scissors,
  Stethoscope,
  Building,
  Car,
  Dumbbell,
  GraduationCap,
  Home,
  ArrowRight,
  Heart,
  Share2,
} from "lucide-react"
import Image from "next/image"

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")

  const categories = [
    { id: "all", name: "All Services", icon: null, count: 1200 },
    { id: "restaurants", name: "Restaurants", icon: Utensils, count: 500 },
    { id: "salons", name: "Salons & Spas", icon: Scissors, count: 300 },
    { id: "clinics", name: "Healthcare", icon: Stethoscope, count: 200 },
    { id: "hotels", name: "Hotels", icon: Building, count: 150 },
    { id: "automotive", name: "Car Services", icon: Car, count: 100 },
    { id: "fitness", name: "Fitness", icon: Dumbbell, count: 80 },
    { id: "education", name: "Education", icon: GraduationCap, count: 120 },
    { id: "home", name: "Home Services", icon: Home, count: 250 },
  ]

  const services = [
    {
      id: 1,
      name: "The Spice Route",
      category: "restaurants",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.8,
      reviews: 324,
      location: "Mumbai, India",
      price: "₹₹₹",
      cuisine: "Indian, Continental",
      nextAvailable: "Today 7:30 PM",
      features: ["Live Music", "Outdoor Seating", "Valet Parking"],
      distance: "2.3 km",
    },
    {
      id: 2,
      name: "Glamour Studio",
      category: "salons",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.9,
      reviews: 156,
      location: "Delhi, India",
      price: "₹₹",
      services: "Hair, Makeup, Spa",
      nextAvailable: "Tomorrow 11:00 AM",
      features: ["Bridal Packages", "Premium Products", "Expert Stylists"],
      distance: "1.8 km",
    },
    {
      id: 3,
      name: "City Care Clinic",
      category: "clinics",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.7,
      reviews: 89,
      location: "Bangalore, India",
      price: "₹₹",
      specialties: "General, Cardiology",
      nextAvailable: "Today 4:00 PM",
      features: ["Digital Reports", "Online Consultation", "Insurance Accepted"],
      distance: "3.1 km",
    },
    {
      id: 4,
      name: "Grand Palace Hotel",
      category: "hotels",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.6,
      reviews: 267,
      location: "Indore, India",
      price: "₹₹₹₹",
      amenities: "Pool, Spa, Restaurant",
      nextAvailable: "Check-in Today",
      features: ["Free WiFi", "Room Service", "Business Center"],
      distance: "5.2 km",
    },
    {
      id: 5,
      name: "AutoCare Express",
      category: "automotive",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.5,
      reviews: 78,
      location: "Pune, India",
      price: "₹₹",
      services: "Wash, Service, Repair",
      nextAvailable: "Today 2:00 PM",
      features: ["Doorstep Service", "Genuine Parts", "Warranty"],
      distance: "4.7 km",
    },
    {
      id: 6,
      name: "FitZone Gym",
      category: "fitness",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.4,
      reviews: 134,
      location: "Chennai, India",
      price: "₹₹",
      facilities: "Cardio, Weights, Classes",
      nextAvailable: "Open Now",
      features: ["Personal Training", "Group Classes", "Modern Equipment"],
      distance: "1.2 km",
    },
  ]

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Discover Amazing Services</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find and book from thousands of verified service providers in your area
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for services, locations, or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                      selectedCategory === category.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {category.icon && <category.icon className="w-5 h-5 mr-3" />}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Quick Filters */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Filters</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" />
                    <span className="text-sm text-gray-700">Open Now</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" />
                    <span className="text-sm text-gray-700">Highly Rated (4.5+)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" />
                    <span className="text-sm text-gray-700">Near Me (5km)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-3" />
                    <span className="text-sm text-gray-700">Instant Booking</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{filteredServices.length} services found</h2>
                <p className="text-gray-600">
                  {selectedCategory === "all"
                    ? "All categories"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                  <option>Sort by: Relevance</option>
                  <option>Rating (High to Low)</option>
                  <option>Distance (Near to Far)</option>
                  <option>Price (Low to High)</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      width={300}
                      height={200}
                      style={{ height: "auto" }}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-green-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {service.nextAvailable}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {service.location} • {service.distance}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-gray-500 text-sm ml-1">({service.reviews})</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">{service.price}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {service.category === "restaurants" && service.cuisine}
                        {service.category === "salons" && service.services}
                        {service.category === "clinics" && service.specialties}
                        {service.category === "hotels" && service.amenities}
                        {service.category === "automotive" && service.services}
                        {service.category === "fitness" && service.facilities}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.features.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="px-6">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="px-8">
                Load More Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
