"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Calendar,
  Clock,
  Star,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Bell,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  CreditCard,
  User,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getBusinessDashboardData, initializeBusinessDashboard, type BusinessDashboardData } from "@/lib/business-stats"

export default function BusinessDashboard() {
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)
  
  // Always call useAuth hook (Rules of Hooks)
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      loadDashboardData()
    }
  }, [mounted, user])

  // Add interval to refresh dashboard data
  useEffect(() => {
    if (!mounted || !user) return

    const interval = setInterval(() => {
      loadDashboardData()
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [mounted, user])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      let dashboard = await getBusinessDashboardData(user.id)

      // If no dashboard exists, initialize it
      if (!dashboard.businessInfo.id) {
        await initializeBusinessDashboard(user.id)
        dashboard = await getBusinessDashboardData(user.id)
      }

      setDashboardData(dashboard)
    } catch (error) {
      console.error("Error loading dashboard:", error)
      // Set a fallback dashboard data structure
      setDashboardData({
        businessInfo: {
          id: '',
          user_id: user.id,
          business_name: profile?.business_name || 'Your Business',
          business_category: profile?.business_category || 'General',
          business_description: profile?.business_description || '',
          business_hours: {},
          contact_info: {},
          location: profile?.location || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          subscription_status: 'free',
          pro_features_enabled: false,
          total_bookings: 0,
          rating: 0,
          verified: false
        },
        stats: {
          totalBookings: 0,
          monthlyRevenue: 0,
          customerRating: 0,
          activeCustomers: 0,
          pendingBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageBookingValue: 0,
          totalCustomers: 0,
          thisMonthBookings: 0,
          lastMonthBookings: 0,
          revenueGrowth: 0
        },
        recentBookings: [],
        services: [],
        businessHours: {}
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  if (!mounted || loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Extract data for easier access
  const { stats, recentBookings, services, businessHours } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BookNow</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Business
                </Badge>
              </Link>
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.business_name || profile?.full_name || user?.email?.split('@')[0] || "Business Owner"}!
              </h1>
              <p className="text-blue-100">Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        +18% from last month
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.customerRating}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Excellent rating
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        +8% from last month
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">₹{stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="font-semibold">₹{(stats.monthlyRevenue * 0.85).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Booking</span>
                      <span className="font-semibold">₹{stats.averageBookingValue}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <p className="text-xs text-gray-600">75% of monthly target achieved</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Bookings
                    </div>
                    <Link href="#" onClick={() => setActiveTab("bookings")}>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.slice(0, 4).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.serviceName}</p>
                          <p className="text-xs text-gray-500">
                            {booking.bookingDate} at {booking.bookingTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Plus className="w-6 h-6" />
                    <span>Add New Service</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Calendar className="w-6 h-6" />
                    <span>View Calendar</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <MessageSquare className="w-6 h-6" />
                    <span>Customer Messages</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>

            {/* Booking Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{stats.completedBookings}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{stats.cancelledBookings}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.serviceName}</p>
                          <p className="text-xs text-gray-500">
                            {booking.bookingDate} at {booking.bookingTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{booking.amount}</p>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">₹{service.price}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bookings this month:</span>
                        <span>{service.bookingsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span>₹{service.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.activeCustomers}</div>
                    <div className="text-sm text-gray-600">Active Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">₹{stats.averageBookingValue}</div>
                    <div className="text-sm text-gray-600">Average Booking Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.customerRating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </div>
                <p className="text-gray-600">Customer management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(businessHours).map(([day, hours]) => {
                    const hoursData = hours as any;
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-20 text-sm font-medium capitalize">{day}</span>
                          <Switch checked={!hoursData.closed} />
                        </div>
                        {!hoursData.closed && (
                          <div className="flex items-center space-x-2">
                            <Input type="time" defaultValue={hoursData.open} className="w-24" />
                            <span>to</span>
                            <Input type="time" defaultValue={hoursData.close} className="w-24" />
                          </div>
                        )}
                        {hoursData.closed && <span className="text-sm text-gray-500">Closed</span>}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive booking confirmations via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive booking alerts via SMS</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Customer Reminders</p>
                      <p className="text-sm text-gray-600">Send automatic reminders to customers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span>Online Payments</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>Cash Payments</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Advance Payment Required (%)</Label>
                    <Input type="number" placeholder="25" />
                  </div>
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <Badge className="bg-green-100 text-green-800">Starter Plan</Badge>
                    <p className="text-2xl font-bold">Free</p>
                    <p className="text-sm text-gray-600">Up to 50 bookings per month</p>
                    <Button className="w-full">Upgrade Plan</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      await signOut()
                      window.location.href = "/login"
                    }}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
