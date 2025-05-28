"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, ChevronDown } from "lucide-react"

interface LocationSelectorProps {
  selectedLocation: string
  onLocationChange: (location: string) => void
}

export function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  const popularCities = [
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Indore, India",
    "Pune, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "New York, USA",
    "London, UK",
    "Dubai, UAE",
    "Singapore",
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline max-w-32 truncate">{selectedLocation}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {popularCities.map((city) => (
          <DropdownMenuItem key={city} onClick={() => onLocationChange(city)} className="cursor-pointer">
            <MapPin className="w-4 h-4 mr-2" />
            {city}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
