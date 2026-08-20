import React, { useState, useEffect } from 'react'
import type { AIItineraryPayload } from '@/services/api/aiApi'
import { placesApi } from '@/services/api/placesApi'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SparklesIcon,
  Location01Icon,
  Calendar01Icon,
  UserIcon,
  MoneyBagIcon,
  Car01Icon,
  Home01Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons'

interface ItineraryFormProps {
  onSubmit: (payload: AIItineraryPayload) => void
  isLoading: boolean
}

const TRAVEL_STYLES = [
  'Adventure',
  'Nature',
  'Photography',
  'Family',
  'Temple',
  'Historical',
  'Road Trip',
  'Food',
  'Luxury',
  'Romantic',
  'Weekend',
  'Eco Tourism',
]

export const ItineraryForm: React.FC<ItineraryFormProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState('Panaji')
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [source, setSource] = useState('')
  const [startDate] = useState('')
  const [endDate] = useState('')
  const [travelTime, setTravelTime] = useState('2 Days / 1 Night')
  const [budget, setBudget] = useState('Moderate')
  const [transportation, setTransportation] = useState('Car')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [seniors, setSeniors] = useState(0)
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Nature', 'Weekend'])
  const [selectedAccessibility] = useState<string[]>([])
  const [selectedFood] = useState<string[]>(['No Preference'])
  const [accommodation, setAccommodation] = useState('Resort')

  // Destination autocomplete from backend places API
  useEffect(() => {
    if (destination.length >= 2) {
      placesApi.getPlaces({ query: destination, limit: 5 }).then((res) => {
        const places = res.items || res.data || []
        const cities = Array.from(
          new Set(places.map((p) => p.city).filter((c): c is string => Boolean(c)))
        )
        setDestinationSuggestions(cities)
      }).catch(() => {})
    } else {
      setDestinationSuggestions([])
    }
  }, [destination])

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (destination.trim()) {
      onSubmit({
        destination: destination.trim(),
        source: source.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        travel_time: travelTime,
        budget,
        transportation,
        travel_style: selectedStyles,
        accessibility: selectedAccessibility,
        food_preferences: selectedFood,
        accommodation_preference: accommodation,
        adults,
        children,
        seniors,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-sm border border-border bg-card shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <HugeiconsIcon icon={SparklesIcon} className="size-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-heading text-foreground">AI Travel Parameters</h3>
          <p className="text-xs text-muted-foreground">Configure your itinerary preferences for neural generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {/* Step 1: Destination Autocomplete */}
        <div className="space-y-1.5 relative">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-emerald-400" />
            <span>Destination City / Region</span>
          </label>
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Search destination (e.g. Panaji)..."
            className="w-full h-9 px-3 rounded-sm border border-border bg-card text-foreground focus:outline-none focus:border-emerald-500 font-mono"
          />
          {destinationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-sm shadow-lg mt-1 max-h-36 overflow-y-auto">
              {destinationSuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setDestination(city)
                    setDestinationSuggestions([])
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted text-xs font-mono text-foreground"
                >
                  📍 {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Source */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Starting Location (Optional)</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full h-9 px-3 rounded-sm border border-border bg-card text-foreground focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Step 3: Duration */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-emerald-400" />
            <span>Trip Duration</span>
          </label>
          <Select value={travelTime} onValueChange={(val: any) => val && setTravelTime(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Trip Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="1 Day Express" className="text-xs font-mono">1 Day Express</SelectItem>
              <SelectItem value="2 Days / 1 Night" className="text-xs font-mono">2 Days / 1 Night</SelectItem>
              <SelectItem value="3 Days / 2 Nights" className="text-xs font-mono">3 Days / 2 Nights</SelectItem>
              <SelectItem value="5 Days Explorer" className="text-xs font-mono">5 Days Explorer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={MoneyBagIcon} className="size-3.5 text-emerald-400" />
            <span>Budget Tier</span>
          </label>
          <Select value={budget} onValueChange={(val: any) => val && setBudget(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Budget Tier" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="Low (₹)" className="text-xs font-mono">Low (₹)</SelectItem>
              <SelectItem value="Moderate (₹₹)" className="text-xs font-mono">Moderate (₹₹)</SelectItem>
              <SelectItem value="Luxury (₹₹₹)" className="text-xs font-mono">Luxury (₹₹₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transportation */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Car01Icon} className="size-3.5 text-emerald-400" />
            <span>Transportation Mode</span>
          </label>
          <Select value={transportation} onValueChange={(val: any) => val && setTransportation(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Transportation Mode" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="Car" className="text-xs font-mono">Private Car / Rental</SelectItem>
              <SelectItem value="Bus" className="text-xs font-mono">Public Transit / Bus</SelectItem>
              <SelectItem value="Train" className="text-xs font-mono">Train</SelectItem>
              <SelectItem value="Walking" className="text-xs font-mono">Walking / Bicycle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Accommodation */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Home01Icon} className="size-3.5 text-emerald-400" />
            <span>Accommodation</span>
          </label>
          <Select value={accommodation} onValueChange={(val: any) => val && setAccommodation(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Accommodation Style" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="Hotel" className="text-xs font-mono">Hotel</SelectItem>
              <SelectItem value="Resort" className="text-xs font-mono">Resort</SelectItem>
              <SelectItem value="Homestay" className="text-xs font-mono">Homestay</SelectItem>
              <SelectItem value="Budget Hostel" className="text-xs font-mono">Budget Hostel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Group Travelers */}
      <div className="space-y-2 border-t border-border pt-4">
        <label className="font-bold text-xs text-foreground flex items-center gap-1">
          <HugeiconsIcon icon={UserIcon} className="size-3.5 text-emerald-400" />
          <span>Travelers Count</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground block">Adults</span>
            <input
              type="number"
              min={1}
              max={10}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full h-8 px-2 rounded-sm border border-border bg-card text-foreground font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Children</span>
            <input
              type="number"
              min={0}
              max={10}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full h-8 px-2 rounded-sm border border-border bg-card text-foreground font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Seniors</span>
            <input
              type="number"
              min={0}
              max={10}
              value={seniors}
              onChange={(e) => setSeniors(Number(e.target.value))}
              className="w-full h-8 px-2 rounded-sm border border-border bg-card text-foreground font-mono"
            />
          </div>
        </div>
      </div>

      {/* Travel Style Chips */}
      <div className="space-y-2 border-t border-border pt-4">
        <label className="font-bold text-xs text-foreground flex items-center gap-1">
          <HugeiconsIcon icon={FavouriteIcon} className="size-3.5 text-emerald-400" />
          <span>Travel Style Preferences</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = selectedStyles.includes(style)
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`px-3 py-1 rounded-sm text-xs font-mono font-semibold transition-colors border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {isSelected ? '✓ ' : ''}{style}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
      >
        <HugeiconsIcon icon={SparklesIcon} className="size-4" />
        <span>{isLoading ? 'Processing Neural Itinerary...' : 'Generate AI Travel Itinerary'}</span>
      </button>
    </form>
  )
}

export default ItineraryForm
