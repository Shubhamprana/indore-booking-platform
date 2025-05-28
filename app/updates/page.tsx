"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  CheckCircle,
  Clock,
  Rocket,
  Users,
  Building,
  Code,
  TestTube,
  Globe,
  TrendingUp,
  Bell,
  ArrowRight,
  Play,
  Pause,
  Target,
  Zap,
  Shield,
  Smartphone,
  Database,
  Palette,
  MessageSquare,
  Heart,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/animated-counter"

export default function UpdatesPage() {
  const [selectedPhase, setSelectedPhase] = useState("current")
  const [autoPlay, setAutoPlay] = useState(true)
  const [currentMilestone, setCurrentMilestone] = useState(0)

  const developmentPhases = [
    {
      id: "planning",
      name: "Planning & Design",
      status: "completed",
      progress: 100,
      startDate: "2023-10-01",
      endDate: "2023-12-15",
      color: "green",
      icon: Palette,
      description: "Market research, user experience design, and technical architecture planning",
    },
    {
      id: "development",
      name: "Core Development",
      status: "completed",
      progress: 100,
      startDate: "2023-12-16",
      endDate: "2024-02-28",
      color: "blue",
      icon: Code,
      description: "Building the core platform, user authentication, and basic booking system",
    },
    {
      id: "current",
      name: "Pre-Launch & Testing",
      status: "in-progress",
      progress: 75,
      startDate: "2024-03-01",
      endDate: "2024-04-30",
      color: "orange",
      icon: TestTube,
      description: "Beta testing, user feedback integration, and platform optimization",
    },
    {
      id: "launch",
      name: "Public Launch",
      status: "upcoming",
      progress: 0,
      startDate: "2024-05-01",
      endDate: "2024-05-15",
      color: "purple",
      icon: Rocket,
      description: "Official platform launch with full feature set and marketing campaign",
    },
    {
      id: "expansion",
      name: "Growth & Expansion",
      status: "upcoming",
      progress: 0,
      startDate: "2024-05-16",
      endDate: "2024-12-31",
      color: "indigo",
      icon: Globe,
      description: "Scaling to new cities, adding advanced features, and business partnerships",
    },
  ]

  const milestones = [
    {
      id: 1,
      title: "Project Kickoff",
      description: "Initial team formation and project planning completed",
      date: "2023-10-01",
      status: "completed",
      category: "planning",
      icon: Target,
      details: "Assembled core team of 12 developers, designers, and product managers",
    },
    {
      id: 2,
      title: "Market Research Complete",
      description: "Comprehensive analysis of booking industry and user needs",
      date: "2023-10-15",
      status: "completed",
      category: "planning",
      icon: TrendingUp,
      details: "Surveyed 5,000+ users across 15 cities to understand pain points",
    },
    {
      id: 3,
      title: "UI/UX Design Finalized",
      description: "Complete user interface and experience design approved",
      date: "2023-11-30",
      status: "completed",
      category: "planning",
      icon: Palette,
      details: "Created 150+ screens with accessibility and mobile-first approach",
    },
    {
      id: 4,
      title: "Technical Architecture",
      description: "Scalable system architecture and technology stack decided",
      date: "2023-12-15",
      status: "completed",
      category: "planning",
      icon: Database,
      details: "Designed for 1M+ concurrent users with 99.9% uptime guarantee",
    },
    {
      id: 5,
      title: "Core Platform Development",
      description: "Basic booking system and user management completed",
      date: "2024-01-15",
      status: "completed",
      category: "development",
      icon: Code,
      details: "Built user registration, authentication, and basic booking flow",
    },
    {
      id: 6,
      title: "Mobile App Development",
      description: "iOS and Android applications development finished",
      date: "2024-02-01",
      status: "completed",
      category: "development",
      icon: Smartphone,
      details: "Native apps with offline capabilities and push notifications",
    },
    {
      id: 7,
      title: "Payment Integration",
      description: "Secure payment gateway and wallet system implemented",
      date: "2024-02-15",
      status: "completed",
      category: "development",
      icon: Shield,
      details: "Integrated multiple payment methods with bank-grade security",
    },
    {
      id: 8,
      title: "Business Dashboard",
      description: "Complete business management portal for service providers",
      date: "2024-02-28",
      status: "completed",
      category: "development",
      icon: Building,
      details: "Analytics, booking management, and customer communication tools",
    },
    {
      id: 9,
      title: "Beta Testing Launch",
      description: "Closed beta testing with selected users and businesses",
      date: "2024-03-15",
      status: "completed",
      category: "current",
      icon: TestTube,
      details: "500+ beta testers across 5 cities providing valuable feedback",
    },
    {
      id: 10,
      title: "Pre-Registration Campaign",
      description: "Public pre-registration and referral program launched",
      date: "2024-03-25",
      status: "completed",
      category: "current",
      icon: Users,
      details: "15,000+ users registered with 5,000+ successful referrals",
    },
    {
      id: 11,
      title: "Security Audit",
      description: "Third-party security audit and penetration testing",
      date: "2024-04-10",
      status: "in-progress",
      category: "current",
      icon: Shield,
      details: "Comprehensive security review by leading cybersecurity firm",
    },
    {
      id: 12,
      title: "Performance Optimization",
      description: "Platform optimization for speed and scalability",
      date: "2024-04-20",
      status: "in-progress",
      category: "current",
      icon: Zap,
      details: "Load testing and optimization for peak traffic handling",
    },
    {
      id: 13,
      title: "Final Beta Testing",
      description: "Open beta testing with expanded user base",
      date: "2024-04-25",
      status: "upcoming",
      category: "current",
      icon: TestTube,
      details: "Expanding to 2,000+ beta testers for final validation",
    },
    {
      id: 14,
      title: "Public Launch",
      description: "Official platform launch with full marketing campaign",
      date: "2024-05-01",
      status: "upcoming",
      category: "launch",
      icon: Rocket,
      details: "Grand launch event with media coverage and influencer partnerships",
    },
    {
      id: 15,
      title: "Mobile App Store Release",
      description: "iOS and Android apps available on app stores",
      date: "2024-05-01",
      status: "upcoming",
      category: "launch",
      icon: Smartphone,
      details: "Simultaneous release on Apple App Store and Google Play Store",
    },
    {
      id: 16,
      title: "Business Onboarding",
      description: "Mass onboarding of service providers and businesses",
      date: "2024-05-15",
      status: "upcoming",
      category: "launch",
      icon: Building,
      details: "Onboarding 1,000+ businesses in first month across multiple categories",
    },
    {
      id: 17,
      title: "Multi-City Expansion",
      description: "Expansion to 10 major cities across India",
      date: "2024-06-01",
      status: "upcoming",
      category: "expansion",
      icon: Globe,
      details: "Scaling operations to Mumbai, Delhi, Bangalore, Chennai, and more",
    },
    {
      id: 18,
      title: "Advanced Features",
      description: "AI-powered recommendations and smart scheduling",
      date: "2024-07-01",
      status: "upcoming",
      category: "expansion",
      icon: Zap,
      details: "Machine learning algorithms for personalized user experience",
    },
  ]

  const currentStats = {
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter((m) => m.status === "completed").length,
    overallProgress: Math.round((milestones.filter((m) => m.status === "completed").length / milestones.length) * 100),
    daysToLaunch: Math.ceil((new Date("2024-05-01").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    preRegistrations: 15847,
    betaTesters: 500,
  }

  const recentUpdates = [
    {
      id: 1,
      title: "Security Audit in Progress",
      description: "Third-party security firm conducting comprehensive platform review",
      date: "2024-04-10",
      type: "security",
      priority: "high",
    },
    {
      id: 2,
      title: "Mobile App Beta Testing",
      description: "iOS and Android apps now available for beta testers",
      date: "2024-04-08",
      type: "feature",
      priority: "medium",
    },
    {
      id: 3,
      title: "Performance Improvements",
      description: "Platform speed increased by 40% after latest optimizations",
      date: "2024-04-05",
      type: "improvement",
      priority: "medium",
    },
    {
      id: 4,
      title: "New Business Partners",
      description: "50+ new service providers joined our platform this week",
      date: "2024-04-03",
      type: "business",
      priority: "low",
    },
  ]

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setCurrentMilestone((prev) => (prev + 1) % milestones.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoPlay, milestones.length])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "in-progress":
        return "text-orange-600 bg-orange-100"
      case "upcoming":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPhaseColor = (color: string) => {
    switch (color) {
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-cyan-500"
      case "orange":
        return "from-orange-500 to-amber-500"
      case "purple":
        return "from-purple-500 to-violet-500"
      case "indigo":
        return "from-indigo-500 to-blue-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

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
                Pre-Launch
              </Badge>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Development Timeline</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Track our journey from concept to launch. See real-time progress, upcoming milestones, and
              behind-the-scenes updates.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  <AnimatedCounter end={currentStats.overallProgress} suffix="%" />
                </div>
                <div className="text-blue-100">Complete</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  <AnimatedCounter end={currentStats.daysToLaunch} />
                </div>
                <div className="text-blue-100">Days to Launch</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  <AnimatedCounter end={currentStats.completedMilestones} />
                </div>
                <div className="text-blue-100">Milestones Done</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  <AnimatedCounter end={currentStats.preRegistrations} />
                </div>
                <div className="text-blue-100">Pre-registered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="timeline" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="updates">Recent Updates</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-8">
            {/* Timeline Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Timeline</h3>
                    <p className="text-gray-600">Follow our development journey from planning to launch and beyond</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoPlay(!autoPlay)}
                      className="flex items-center space-x-2"
                    >
                      {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{autoPlay ? "Pause" : "Play"}</span>
                    </Button>
                    <Badge variant="secondary">
                      {currentStats.completedMilestones} / {currentStats.totalMilestones} Complete
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`relative flex items-start space-x-6 ${
                      currentMilestone === index && autoPlay ? "animate-pulse" : ""
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                        milestone.status === "completed"
                          ? "bg-green-500"
                          : milestone.status === "in-progress"
                            ? "bg-orange-500"
                            : "bg-gray-300"
                      } shadow-lg`}
                    >
                      {milestone.status === "completed" ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <milestone.icon className="w-8 h-8 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <Card className="flex-1 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{milestone.title}</h3>
                              <Badge className={getStatusColor(milestone.status)}>
                                {milestone.status.replace("-", " ")}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{milestone.description}</p>
                            <p className="text-sm text-gray-500">{milestone.details}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(milestone.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {milestone.status === "completed"
                                ? "Completed"
                                : milestone.status === "in-progress"
                                  ? "In Progress"
                                  : "Upcoming"}
                            </div>
                          </div>
                        </div>

                        {milestone.status === "in-progress" && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-8">
            <div className="grid gap-6">
              {developmentPhases.map((phase) => (
                <Card
                  key={phase.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPhase === phase.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedPhase(phase.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getPhaseColor(
                            phase.color,
                          )} flex items-center justify-center`}
                        >
                          <phase.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{phase.name}</h3>
                          <p className="text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(phase.status)}>{phase.status.replace("-", " ")}</Badge>
                        <div className="text-sm text-gray-500 mt-2">
                          {new Date(phase.startDate).toLocaleDateString()} -{" "}
                          {new Date(phase.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-3" />
                    </div>

                    {selectedPhase === phase.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Phase Milestones</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {milestones
                            .filter((m) => m.category === phase.id)
                            .map((milestone) => (
                              <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    milestone.status === "completed"
                                      ? "bg-green-500"
                                      : milestone.status === "in-progress"
                                        ? "bg-orange-500"
                                        : "bg-gray-300"
                                  }`}
                                >
                                  {milestone.status === "completed" ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{milestone.title}</div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(milestone.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recent Updates Tab */}
          <TabsContent value="updates" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Updates */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Latest Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {recentUpdates.map((update) => (
                      <div key={update.id} className="border-l-4 border-blue-500 pl-6 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          <Badge
                            variant={
                              update.priority === "high"
                                ? "destructive"
                                : update.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {update.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{update.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(update.date).toLocaleDateString()}</span>
                          <Badge variant="outline">{update.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Milestones */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Next Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {milestones
                      .filter((m) => m.status === "upcoming")
                      .slice(0, 4)
                      .map((milestone) => (
                        <div key={milestone.id} className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <milestone.icon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="text-xs text-blue-600 font-medium">
                            {new Date(milestone.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                {/* Subscribe to Updates */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Stay Updated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Get notified about major milestones and launch updates</p>
                    <div className="space-y-3">
                      <Button className="w-full">
                        <Bell className="w-4 h-4 mr-2" />
                        Enable Notifications
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Join Community
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter end={currentStats.overallProgress} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter end={currentStats.preRegistrations} />
                  </div>
                  <div className="text-sm text-gray-600">Pre-registrations</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TestTube className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter end={currentStats.betaTesters} />
                  </div>
                  <div className="text-sm text-gray-600">Beta Testers</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter end={currentStats.daysToLaunch} />
                  </div>
                  <div className="text-sm text-gray-600">Days to Launch</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Development Progress by Phase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {developmentPhases.map((phase) => (
                    <div key={phase.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{phase.name}</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        <AnimatedCounter end={15847} />
                      </div>
                      <div className="text-gray-600">Total Pre-registrations</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          <AnimatedCounter end={5247} />
                        </div>
                        <div className="text-xs text-gray-600">Referrals</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          <AnimatedCounter end={2156} />
                        </div>
                        <div className="text-xs text-gray-600">Businesses</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Behind the Scenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter end={12} />
                    </div>
                    <div className="text-sm text-gray-600">Team Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter end={2847} />
                    </div>
                    <div className="text-sm text-gray-600">Code Commits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter end={156} />
                    </div>
                    <div className="text-sm text-gray-600">Features Built</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter end={24} suffix="/7" />
                    </div>
                    <div className="text-sm text-gray-600">Development</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Want to Be Part of the Journey?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our community of early adopters and get exclusive updates, behind-the-scenes content, and early
              access to new features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Join Pre-Launch
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/referral">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4 mr-2" />
                  Refer Friends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
