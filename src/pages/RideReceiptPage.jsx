import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  MapPin,
  Car,
  User,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Receipt,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { getRideReceipt } from '@/services/ridePaymentApi'
import { getRideType } from '@/config/rideTypes'

export function RideReceiptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      const { data, error: err } = await getRideReceipt(id)
      if (err) {
        setError(err)
      } else {
        setReceipt(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleShare = async () => {
    if (!receipt) return
    const fare = receipt.final_fare || receipt.estimated_fare || 0
    const text = `Cardom Ride Receipt\nRef: ${receipt.booking_reference}\nFrom: ${receipt.pickup_address}\nTo: ${receipt.drop_address}\nTotal: ₹${fare}\nStatus: ${receipt.payment_status === 'confirmed' ? 'Paid' : 'Pending'}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cardom Receipt - ${receipt.booking_reference}`,
          text,
        })
        return
      } catch (_) {
        // User cancelled or unsupported, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (_) {
      // fallback
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
        <p className="text-sm text-[#A1A1AA]">Generating your receipt…</p>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold">Receipt Not Available</h2>
        <p className="text-sm text-[#A1A1AA] mb-6">{error || 'Could not find details for this ride.'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          Back to Bookings
        </button>
      </div>
    )
  }

  const rideType = getRideType(receipt.ride_type)
  const finalFare = Number(receipt.final_fare || receipt.estimated_fare || 0)
  const isPaid = receipt.payment_status === 'confirmed' || receipt.payment_status === 'paid'
  const isCash = receipt.payment_method?.toLowerCase() === 'cash'

  // Estimate breakdown
  const baseFare = rideType.baseFare || 50
  const totalDistance = Number(receipt.estimated_distance_km || 5)
  const distanceFare = Math.max(0, Math.round(finalFare * 0.75))
  const taxesAndFees = Math.max(0, Math.round(finalFare - distanceFare - baseFare))

  const tripDate = receipt.created_at
    ? new Date(receipt.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Trip'

  const tripTime = receipt.created_at
    ? new Date(receipt.created_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const partnerProfile = receipt.ride_assignments?.[0]?.partner_profiles

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white pb-12">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222] px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold tracking-wide">CARDOM RECEIPT</h1>
          <p className="text-[10px] text-[#A1A1AA] font-mono">{receipt.booking_reference}</p>
        </div>
        <button
          onClick={handleShare}
          className="p-2 -mr-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          title="Share Receipt"
        >
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {/* Receipt Main Card */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle Orange Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Cardom Logo & Status Header */}
          <div className="flex items-center justify-between border-b border-[#222] pb-5 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black text-lg">
                C
              </div>
              <div>
                <span className="text-base font-black tracking-wider block">CARDOM</span>
                <span className="text-[10px] text-[#A1A1AA] tracking-widest uppercase">Official Receipt</span>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isPaid
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isPaid ? 'Paid' : 'Payment Marked'}
            </div>
          </div>

          {/* Amount Paid Hero */}
          <div className="text-center py-2 border-b border-[#222] pb-5 mb-5">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wider font-medium mb-1">Total Paid</p>
            <div className="text-4xl font-black text-white tracking-tight">
              ₹{finalFare.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              Paid via {isCash ? 'Cash' : 'Direct UPI'} • {tripDate}
            </p>
          </div>

          {/* Route Section */}
          <div className="space-y-4 border-b border-[#222] pb-5 mb-5">
            <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest">TRIP ROUTE</p>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#A1A1AA] uppercase block font-semibold">Pickup Location</span>
                <p className="text-xs text-white font-medium break-words mt-0.5">{receipt.pickup_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#A1A1AA] uppercase block font-semibold">Drop-off Location</span>
                <p className="text-xs text-white font-medium break-words mt-0.5">{receipt.drop_address}</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver Section */}
          <div className="border-b border-[#222] pb-5 mb-5 space-y-3">
            <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest">DRIVER & VEHICLE</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                Driver Name
              </span>
              <span className="text-white font-semibold">
                {receipt.driver_name || partnerProfile?.authorized_contact_name || partnerProfile?.business_name || 'Cardom Driver'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-orange-400" />
                Vehicle & Category
              </span>
              <span className="text-white font-semibold">
                {receipt.driver_vehicle_model || rideType.name}
              </span>
            </div>
            {receipt.driver_vehicle_plate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Vehicle Number</span>
                <span className="text-white font-mono font-bold bg-[#202020] px-2 py-0.5 rounded border border-[#333]">
                  {receipt.driver_vehicle_plate}
                </span>
              </div>
            )}
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-2.5 border-b border-[#222] pb-5 mb-5">
            <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest">FARE BREAKDOWN</p>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Base Fare</span>
              <span className="text-white font-medium">₹{baseFare}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Distance Fare ({totalDistance} km)</span>
              <span className="text-white font-medium">₹{distanceFare}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Taxes & Platform GST (5%)</span>
              <span className="text-white font-medium">₹{taxesAndFees}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-[#222]">
              <span>Total Fare</span>
              <span className="text-orange-400">₹{finalFare}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-2 text-xs">
            <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest">PAYMENT INFORMATION</p>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                {isCash ? <Banknote className="w-3.5 h-3.5 text-green-400" /> : <CreditCard className="w-3.5 h-3.5 text-cyan-400" />}
                Payment Mode
              </span>
              <span className="text-white font-semibold">
                {isCash ? 'Cash to Driver' : 'Direct UPI Payment'}
              </span>
            </div>
            {!isCash && (partnerProfile?.upi_id || receipt.driver_upi_id) && (
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Payee UPI VPA</span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  {partnerProfile?.upi_id || receipt.driver_upi_id}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Trip Completed</span>
              <span className="text-white font-medium">
                {tripDate} {tripTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#A1A1AA]" />
                Share Receipt
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="flex-1 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Receipt className="w-4 h-4" />
            My Bookings
          </button>
        </div>
      </div>
    </div>
  )
}

