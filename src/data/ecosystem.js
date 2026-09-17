import {
  Car,
  Tag,
  CreditCard,
  Shield,
  Repeat2,
  Wrench,
  Sparkles,
  PhoneCall,
  Package,
} from 'lucide-react'

/**
 * 9 Core Services that make up the Cardom Automotive Ecosystem.
 * Angle specifies position around the 360° circle in desktop radial view:
 * 0: -90° (top) through 8: 230° (top-left) spaced by 40°.
 */
export const ECOSYSTEM_SERVICES = [
  {
    id: 'buy',
    title: 'Buy',
    label: 'Vehicle Purchase',
    description: 'Discover vehicles that match your needs.',
    detail: 'Certified pre-owned and new cars with verified digital history and price protection.',
    Icon: Car,
    angle: -90, // Top
    badge: '01',
  },
  {
    id: 'finance',
    title: 'Finance',
    label: 'Auto Loans & EMI',
    description: 'Explore financing options for your next vehicle.',
    detail: 'Instant eligibility checks, zero-downpayment options, and transparent interest rates.',
    Icon: CreditCard,
    angle: -50, // Top Right
    badge: '02',
  },
  {
    id: 'insurance',
    title: 'Insurance',
    label: 'Instant Coverage',
    description: 'Find coverage for your vehicle.',
    detail: 'Compare comprehensive policies, zero-dep add-ons, and instant policy generation.',
    Icon: Shield,
    angle: -10, // Mid Right
    badge: '03',
  },
  {
    id: 'subscription',
    title: 'Subscription',
    label: 'Flexible Driving',
    description: 'Drive without committing to ownership.',
    detail: 'All-inclusive monthly car rentals with insurance, maintenance, and free upgrades.',
    Icon: Repeat2,
    angle: 30, // Lower Right
    badge: '04',
  },
  {
    id: 'service',
    title: 'Service & Repair',
    label: 'Certified Care',
    description: 'Keep your vehicle maintained and road-ready.',
    detail: 'Doorstep pickup, genuine parts guarantee, and transparent diagnostic pricing.',
    Icon: Wrench,
    angle: 70, // Bottom Right
    badge: '05',
  },
  {
    id: 'detailing',
    title: 'Detailing',
    label: 'Aesthetics & Spa',
    description: "Professional care for your car's appearance.",
    detail: 'Ceramic coatings, interior sterilization, PPF application, and paint correction.',
    Icon: Sparkles,
    angle: 110, // Bottom Left
    badge: '06',
  },
  {
    id: 'roadside',
    title: 'Roadside Assistance',
    label: '24/7 SOS',
    description: 'Get help when you need it on the road.',
    detail: 'Emergency breakdown towing, jumpstarts, emergency fuel, and tyre replacements.',
    Icon: PhoneCall,
    angle: 150, // Lower Left
    badge: '07',
  },
  {
    id: 'parts',
    title: 'Spare Parts',
    label: 'OEM Catalog',
    description: 'Find parts for maintenance and repairs.',
    detail: 'Direct factory replacement parts, warranty-backed accessories, and fast logistics.',
    Icon: Package,
    angle: 190, // Mid Left
    badge: '08',
  },
  {
    id: 'sell',
    title: 'Sell',
    label: 'Instant Valuation',
    description: 'List and reach buyers looking for your car.',
    detail: 'Doorstep inspection, instant paperless transfer, and verified payment escrow.',
    Icon: Tag,
    angle: 230, // Top Left
    badge: '09',
  },
]

