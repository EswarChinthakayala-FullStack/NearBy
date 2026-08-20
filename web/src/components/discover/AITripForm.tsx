import React, { useState } from 'react'
import type { AIItineraryPayload } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, Calendar01Icon, Location01Icon } from '@hugeicons/core-free-icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AITripFormProps {
  onSubmit: (payload: AIItineraryPayload) => void
  isLoading: boolean
}

export const AITripForm: React.FC<AITripFormProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState('Goa')
  const [source, setSource] = useState('')
  const [travelTime, setTravelTime] = useState('2 Days / 1 Night')
  const [budget, setBudget] = useState('Moderate')
  const [transportation, setTransportation] = useState('Car')
  const [adults, setAdults] = useState(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (destination.trim()) {
      onSubmit({
        destination: destination.trim(),
        source: source.trim() || undefined,
        travel_time: travelTime,
        budget,
        transportation,
        adults,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-sm border border-border bg-card shadow-md space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <HugeiconsIcon icon={SparklesIcon} className="size-4" />
        </div>
        <div>
          <h3 className="text-base font-bold font-heading text-foreground">AI Neural Itinerary Generator</h3>
          <p className="text-xs text-muted-foreground">Specify your trip parameters to generate a custom multi-day plan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-emerald-400" />
            <span>Destination City / Region</span>
          </label>
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Panaji, Goa"
            className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground focus:outline-none focus:border-emerald-500 font-mono text-xs"
          />
        </div>

        {/* Source */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Starting Location (Optional)</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground focus:outline-none focus:border-emerald-500 font-mono text-xs"
          />
        </div>

        {/* Travel Time */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground flex items-center gap-1">
            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-emerald-400" />
            <span>Trip Duration</span>
          </label>
          <Select value={travelTime} onValueChange={(val: any) => val && setTravelTime(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Duration" />
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
          <label className="font-bold text-foreground">Budget Tier</label>
          <Select value={budget} onValueChange={(val: any) => val && setBudget(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Budget Tier" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="Backpacker ($)" className="text-xs font-mono">Backpacker ($)</SelectItem>
              <SelectItem value="Moderate ($$)" className="text-xs font-mono">Moderate ($$)</SelectItem>
              <SelectItem value="Luxury ($$$)" className="text-xs font-mono">Luxury ($$$)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transportation */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Primary Transport</label>
          <Select value={transportation} onValueChange={(val: any) => val && setTransportation(String(val))}>
            <SelectTrigger className="w-full h-11 rounded-sm border-input bg-background font-mono text-xs">
              <SelectValue placeholder="Select Primary Transport" />
            </SelectTrigger>
            <SelectContent className="rounded-sm border-border bg-card shadow-md">
              <SelectItem value="Car" className="text-xs font-mono">Private Car / Rental</SelectItem>
              <SelectItem value="Public Transit" className="text-xs font-mono">Public Transit / Bus</SelectItem>
              <SelectItem value="Walking" className="text-xs font-mono">Walking / Bicycle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adults */}
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Travelers Count</label>
          <input
            type="number"
            min={1}
            max={10}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full h-11 px-3 rounded-sm border border-input bg-background text-foreground focus:outline-none focus:border-emerald-500 font-mono text-xs"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <HugeiconsIcon icon={SparklesIcon} className="size-4" />
        <span>{isLoading ? 'Generating Plan...' : 'Generate Neural Itinerary'}</span>
      </button>
    </form>
  )
}

export default AITripForm
