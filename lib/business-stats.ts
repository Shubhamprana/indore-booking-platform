import { supabase } from "./supabase"

// Cache for business dashboard data
const dashboardCache = new Map<string, { data: BusinessDashboardData, timestamp: number }>()
const CACHE_DURATION = 120000 // 2 minutes

export interface BusinessStats {
  totalBookings: number
  monthlyRevenue: number
  customerRating: number
  activeCustomers: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  averageBookingValue: number
  totalCustomers: number
  thisMonthBookings: number
  lastMonthBookings: number
  revenueGrowth: number
}

export interface BusinessBooking {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  amount: number
  status: string
  notes?: string
  createdAt: string
}

export interface BusinessService {
  id: string
  name: string
  price: number
  duration: number
  description?: string
  isActive: boolean
  bookingsCount: number
  totalRevenue: number
}

export interface BusinessDashboardData {
  stats: BusinessStats
  recentBookings: BusinessBooking[]
  services: BusinessService[]
  businessHours: any
  businessInfo: any
}

// Get business statistics
export async function getBusinessStats(businessId: string): Promise<BusinessStats> {
  try {
    // Get total bookings
    const { count: totalBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)

    // Get this month's bookings
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: thisMonthBookingsData, count: thisMonthBookings } = await supabase
      .from("bookings")
      .select("total_amount", { count: "exact" })
      .eq("business_id", businessId)
      .gte("created_at", startOfMonth.toISOString())

    // Get last month's bookings for comparison
    const startOfLastMonth = new Date()
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setDate(1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const endOfLastMonth = new Date()
    endOfLastMonth.setDate(0)
    endOfLastMonth.setHours(23, 59, 59, 999)

    const { count: lastMonthBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", startOfLastMonth.toISOString())
      .lte("created_at", endOfLastMonth.toISOString())

    // Calculate monthly revenue
    const monthlyRevenue = thisMonthBookingsData?.reduce((sum, booking) => {
      return sum + (parseFloat(booking.total_amount || "0"))
    }, 0) || 0

    // Get booking status counts
    const { count: pendingBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "pending")

    const { count: completedBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "completed")

    const { count: cancelledBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "cancelled")

    // Get unique customers count
    const { data: customersData } = await supabase
      .from("bookings")
      .select("customer_id")
      .eq("business_id", businessId)

    const uniqueCustomers = new Set(customersData?.map(b => b.customer_id) || [])
    const totalCustomers = uniqueCustomers.size

    // Calculate average booking value
    const { data: allBookingsData } = await supabase
      .from("bookings")
      .select("total_amount")
      .eq("business_id", businessId)
      .not("total_amount", "is", null)

    const averageBookingValue = allBookingsData && allBookingsData.length > 0
      ? allBookingsData.reduce((sum, booking) => sum + parseFloat(booking.total_amount || "0"), 0) / allBookingsData.length
      : 0

    // Calculate revenue growth
    const revenueGrowth = lastMonthBookings && lastMonthBookings > 0
      ? ((thisMonthBookings || 0) - lastMonthBookings) / lastMonthBookings * 100
      : 0

    return {
      totalBookings: totalBookings || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      customerRating: 4.8, // This would come from a reviews system
      activeCustomers: totalCustomers,
      pendingBookings: pendingBookings || 0,
      completedBookings: completedBookings || 0,
      cancelledBookings: cancelledBookings || 0,
      averageBookingValue: Math.round(averageBookingValue),
      totalCustomers,
      thisMonthBookings: thisMonthBookings || 0,
      lastMonthBookings: lastMonthBookings || 0,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100
    }
  } catch (error) {
    console.error("Error fetching business stats:", error)
    // Return default stats for new businesses
    return {
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
    }
  }
}

// Get recent bookings
export async function getRecentBookings(businessId: string, limit: number = 10): Promise<BusinessBooking[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        service_name,
        booking_date,
        booking_time,
        total_amount,
        status,
        notes,
        created_at,
        customer_id,
        users!bookings_customer_id_fkey(full_name, email)
      `)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent bookings:", error)
      return []
    }

    return data?.map(booking => ({
      id: booking.id,
      customerName: (booking.users as any)?.full_name || "Unknown Customer",
      customerEmail: (booking.users as any)?.email || "",
      serviceName: booking.service_name,
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      amount: parseFloat(booking.total_amount || "0"),
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.created_at
    })) || []
  } catch (error) {
    console.error("Error in getRecentBookings:", error)
    return []
  }
}

// Get business services from dashboard data
export async function getBusinessServices(businessId: string): Promise<BusinessService[]> {
  try {
    // Get business dashboard data
    const { data: dashboardData } = await supabase
      .from("business_dashboards")
      .select("services_offered")
      .eq("user_id", businessId)
      .single()

    if (!dashboardData?.services_offered) {
      return []
    }

    const services = dashboardData.services_offered as any[]

    // For each service, get booking statistics
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const { count: bookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId)
          .eq("service_name", service.name)

        const { data: revenueData } = await supabase
          .from("bookings")
          .select("total_amount")
          .eq("business_id", businessId)
          .eq("service_name", service.name)
          .eq("status", "completed")

        const totalRevenue = revenueData?.reduce((sum, booking) => {
          return sum + parseFloat(booking.total_amount || "0")
        }, 0) || 0

        return {
          id: service.id || Math.random().toString(36).substring(7),
          name: service.name,
          price: service.price || 0,
          duration: service.duration || 60,
          description: service.description || "",
          isActive: service.isActive !== false,
          bookingsCount: bookingsCount || 0,
          totalRevenue: Math.round(totalRevenue)
        }
      })
    )

    return servicesWithStats
  } catch (error) {
    console.error("Error fetching business services:", error)
    return []
  }
}

// Get complete business dashboard data
export async function getBusinessDashboardData(businessId: string): Promise<BusinessDashboardData> {
  try {
    // Check cache first
    const cached = dashboardCache.get(businessId)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }

    // Optimized: Get all data in parallel to reduce total load time
    const [statsData, recentBookingsData, dashboardInfoData] = await Promise.all([
      getBusinessStatsOptimized(businessId),
      getRecentBookings(businessId, 10),
      supabase
        .from("business_dashboards")
        .select("*")
        .eq("user_id", businessId)
        .single()
    ])

    // Get services separately but faster
    const services = await getBusinessServicesOptimized(businessId, dashboardInfoData.data)

    const result = {
      stats: statsData,
      recentBookings: recentBookingsData,
      services,
      businessHours: dashboardInfoData.data?.business_hours || {},
      businessInfo: dashboardInfoData.data || {}
    }

    // Cache the result
    dashboardCache.set(businessId, {
      data: result,
      timestamp: Date.now()
    })

    return result
  } catch (error) {
    console.error("Error fetching business dashboard data:", error)
    
    // Return default data for new businesses
    const fallbackData = {
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
      businessHours: {},
      businessInfo: {}
    }

    return fallbackData
  }
}

// Optimized version of getBusinessStats that uses fewer queries
async function getBusinessStatsOptimized(businessId: string): Promise<BusinessStats> {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const startOfLastMonth = new Date()
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setDate(1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const endOfLastMonth = new Date()
    endOfLastMonth.setDate(0)
    endOfLastMonth.setHours(23, 59, 59, 999)

    // Get all bookings data in one query instead of multiple
    const { data: allBookings } = await supabase
      .from("bookings")
      .select("total_amount, status, customer_id, created_at")
      .eq("business_id", businessId)

    if (!allBookings) {
      return {
        totalBookings: 0,
        monthlyRevenue: 0,
        customerRating: 4.8,
        activeCustomers: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageBookingValue: 0,
        totalCustomers: 0,
        thisMonthBookings: 0,
        lastMonthBookings: 0,
        revenueGrowth: 0
      }
    }

    // Process all stats from the single query result
    const totalBookings = allBookings.length
    
    const thisMonthBookings = allBookings.filter(b => 
      new Date(b.created_at) >= startOfMonth
    )
    
    const lastMonthBookings = allBookings.filter(b => {
      const date = new Date(b.created_at)
      return date >= startOfLastMonth && date <= endOfLastMonth
    })

    const monthlyRevenue = thisMonthBookings.reduce((sum, booking) => {
      return sum + (parseFloat(booking.total_amount || "0"))
    }, 0)

    const pendingBookings = allBookings.filter(b => b.status === "pending").length
    const completedBookings = allBookings.filter(b => b.status === "completed").length
    const cancelledBookings = allBookings.filter(b => b.status === "cancelled").length

    const uniqueCustomers = new Set(allBookings.map(b => b.customer_id))
    const totalCustomers = uniqueCustomers.size

    const averageBookingValue = allBookings.length > 0
      ? allBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount || "0"), 0) / allBookings.length
      : 0

    const revenueGrowth = lastMonthBookings.length > 0
      ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100
      : 0

    return {
      totalBookings,
      monthlyRevenue: Math.round(monthlyRevenue),
      customerRating: 4.8,
      activeCustomers: totalCustomers,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      averageBookingValue: Math.round(averageBookingValue),
      totalCustomers,
      thisMonthBookings: thisMonthBookings.length,
      lastMonthBookings: lastMonthBookings.length,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100
    }
  } catch (error) {
    console.error("Error fetching optimized business stats:", error)
    return {
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
    }
  }
}

// Optimized version of getBusinessServices
async function getBusinessServicesOptimized(businessId: string, dashboardData: any): Promise<BusinessService[]> {
  try {
    if (!dashboardData?.services_offered) {
      return []
    }

    const services = dashboardData.services_offered as any[]

    // Get all service bookings in one query instead of one per service
    const { data: serviceBookings } = await supabase
      .from("bookings")
      .select("service_name, total_amount, status")
      .eq("business_id", businessId)

    const serviceStats = new Map()

    // Process bookings to calculate stats for each service
    serviceBookings?.forEach(booking => {
      const serviceName = booking.service_name
      if (!serviceStats.has(serviceName)) {
        serviceStats.set(serviceName, {
          bookingsCount: 0,
          totalRevenue: 0
        })
      }
      
      const stats = serviceStats.get(serviceName)
      stats.bookingsCount++
      
      if (booking.status === "completed") {
        stats.totalRevenue += parseFloat(booking.total_amount || "0")
      }
    })

    return services.map(service => ({
      id: service.id || Math.random().toString(36).substring(7),
      name: service.name,
      price: service.price || 0,
      duration: service.duration || 60,
      description: service.description || "",
      isActive: service.isActive !== false,
      bookingsCount: serviceStats.get(service.name)?.bookingsCount || 0,
      totalRevenue: Math.round(serviceStats.get(service.name)?.totalRevenue || 0)
    }))
  } catch (error) {
    console.error("Error fetching optimized business services:", error)
    return []
  }
}

// Function to clear cache (useful for when data is updated)
export function clearBusinessDashboardCache(businessId?: string) {
  if (businessId) {
    dashboardCache.delete(businessId)
  } else {
    dashboardCache.clear()
  }
}

// Create sample booking for testing (you can remove this later)
export async function createSampleBooking(businessId: string, customerId: string) {
  try {
    const sampleBooking = {
      business_id: businessId,
      customer_id: customerId,
      service_name: "Hair Cut & Styling",
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: "10:00",
      duration_minutes: 60,
      total_amount: 1200,
      status: "confirmed",
      notes: "Sample booking for testing"
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert(sampleBooking)
      .select()
      .single()

    if (error) {
      console.error("Error creating sample booking:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createSampleBooking:", error)
    return null
  }
}

// Initialize business dashboard with default data
export async function initializeBusinessDashboard(businessId: string) {
  try {
    const defaultServices = [
      { name: "Hair Cut & Styling", price: 1200, duration: 60, description: "Professional hair cutting and styling", isActive: true },
      { name: "Beard Trim", price: 500, duration: 30, description: "Beard trimming and shaping", isActive: true },
      { name: "Facial Treatment", price: 2000, duration: 90, description: "Deep cleansing facial treatment", isActive: true },
      { name: "Hair Wash", price: 300, duration: 20, description: "Hair washing and conditioning", isActive: true },
    ]

    const defaultBusinessHours = {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: true },
    }

    const { data, error } = await supabase
      .from("business_dashboards")
      .upsert({
        user_id: businessId,
        business_hours: defaultBusinessHours,
        services_offered: defaultServices,
        subscription_plan: "starter",
        plan_status: "active"
      })
      .select()
      .single()

    if (error) {
      console.error("Error initializing business dashboard:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in initializeBusinessDashboard:", error)
    return null
  }
} 