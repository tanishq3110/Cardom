import { useState } from 'react'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { submitRideRating } from '@/services/rideRatingsApi'

export function RideRatingCard({ rideId, existingRating, onRatingSubmitted }) {
  const [selectedRating, setSelectedRating] = useState(existingRating?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState(existingRating?.review || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(!!existingRating)

  const displayRating = hoveredRating || selectedRating

  const handleSubmit = async () => {
    if (!selectedRating) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: err } = await submitRideRating({ rideId, rating: selectedRating, review })
    setSubmitting(false)
    if (err) {
      setError(typeof err === 'string' ? err : 'Failed to submit rating. Please try again.')
    } else {
      setSubmitted(true)
      onRatingSubmitted?.({ rating: selectedRating, review })
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#141414] border border-green-500/25 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Rating Submitted!</p>
            <div className="flex gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3.5 h-3.5 ${
                  s <= selectedRating ? 'text-yellow-400 fill-yellow-400' : 'text-[#444]'
                }`} />
              ))}
            </div>
          </div>
        </div>
        {review && (
          <p className="text-[#A1A1AA] text-xs mt-2 pl-12">"{review}"</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
      <p className="text-white font-bold text-sm text-center">How was your ride?</p>

      {/* Star Rating */}
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setSelectedRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= displayRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-[#444]'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Optional Review */}
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Leave a review (optional)..."
        rows={2}
        className="w-full bg-[#202020] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-orange-500 resize-none"
      />

      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedRating}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit Rating
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="px-4 py-2.5 rounded-xl bg-[#202020] border border-[#333] text-[#A1A1AA] font-semibold text-sm transition-colors cursor-pointer hover:text-white"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
