import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home', { replace: true })
    }, 2200)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-500/15 blur-[100px] pointer-events-none"
      />

      {/* Car silhouette in background */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(249,115,22,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* C Logo mark */}
        <div className="relative">
          <div
            className="w-28 h-28 rounded-3xl bg-orange-500 flex items-center justify-center shadow-[0_0_80px_rgba(249,115,22,0.5)]"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            }}
          >
            <span className="text-6xl font-black text-white leading-none tracking-tighter select-none">
              C
            </span>
          </div>
          {/* Shine overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-white tracking-tight leading-none">
            Cardom
          </h1>
          <p className="text-sm text-zinc-400 mt-3 tracking-[0.15em] uppercase font-medium">
            Drive Your Dreams
          </p>
        </motion.div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="absolute bottom-16 left-0 right-0 flex justify-center"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-orange-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
