/**
 * Centralized Ride Types and Pricing Configuration
 */

export const RIDE_TYPES = [
  {
    id: 'economy',
    name: 'Cardom Go',
    tagline: 'Affordable, compact rides',
    capacity: 4,
    baseFare: 50,
    perKmRate: 14,
    minimumFare: 80,
    etaMinutes: 3,
    icon: 'Car',
    badge: 'Popular',
  },
  {
    id: 'comfort',
    name: 'Cardom Comfort',
    tagline: 'Spacious sedans with top drivers',
    capacity: 4,
    baseFare: 80,
    perKmRate: 18,
    minimumFare: 120,
    etaMinutes: 4,
    icon: 'Car',
    badge: 'Recommended',
  },
  {
    id: 'xl',
    name: 'Cardom Executive XL',
    tagline: 'Premium SUVs for group travel',
    capacity: 6,
    baseFare: 150,
    perKmRate: 26,
    minimumFare: 220,
    etaMinutes: 6,
    icon: 'Car',
    badge: 'Premium',
  },
]

export function getRideType(id) {
  return RIDE_TYPES.find((t) => t.id === id) || RIDE_TYPES[0]
}

export function calcEstimatedFare(id, distanceKm) {
  const tier = getRideType(id)
  if (!tier) return 100
  const calculated = tier.baseFare + (distanceKm || 10) * tier.perKmRate
  return Math.round(Math.max(tier.minimumFare, calculated))
}
