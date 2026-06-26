'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Truck, MapPin, Building2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ROLES, type Role } from '@/lib/rbac'

const personas: {
  role: Role
  icon: React.ElementType
  color: string
  bgGlow: string
  initials: string
  delay: number
}[] = [
  {
    role: 'md',
    icon: Building2,
    color: 'border-necl-accent/40 hover:border-necl-accent',
    bgGlow: 'hover:bg-necl-accent/5',
    initials: 'AM',
    delay: 0.1,
  },
  {
    role: 'fleet-head',
    icon: Truck,
    color: 'border-necl-success/40 hover:border-necl-success',
    bgGlow: 'hover:bg-necl-success/5',
    initials: 'RK',
    delay: 0.2,
  },
  {
    role: 'site-manager',
    icon: MapPin,
    color: 'border-necl-warning/40 hover:border-necl-warning',
    bgGlow: 'hover:bg-necl-warning/5',
    initials: 'PM',
    delay: 0.3,
  },
]

const avatarColors: Record<Role, string> = {
  'md': 'bg-necl-accent',
  'fleet-head': 'bg-necl-success',
  'site-manager': 'bg-necl-warning',
  'analyst': 'bg-purple-500',
}

export default function LoginPage() {
  const router = useRouter()
  const { setRole } = useApp()

  const handleSelect = (role: Role) => {
    setRole(role)
    router.push('/command-center')
  }

  return (
    <div className="min-h-screen bg-necl-bg flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-necl-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-necl-accent/4 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-necl-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-necl-muted) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-necl-accent flex items-center justify-center shadow-2xl glow-blue">
              <span className="text-white text-3xl font-black">N</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-necl-text tracking-wider">NAVAYUGA</h1>
              <p className="text-sm text-necl-muted tracking-[0.3em] uppercase">Engineering Company Ltd</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-necl-accent/60" />
            <Shield className="w-4 h-4 text-necl-accent" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-necl-accent/60" />
          </div>

          <h2 className="text-2xl font-bold text-necl-text mb-2">NECL Jarvis</h2>
          <p className="text-necl-muted text-base">AI Decision-Intelligence Command Center</p>
        </motion.div>

        {/* Role selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-center text-[11px] uppercase tracking-widest text-necl-muted mb-6">
            Select your role to enter
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {personas.map(({ role, icon: Icon, color, bgGlow, initials, delay }) => {
              const roleData = ROLES[role]
              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(role)}
                  className={`
                    rounded-2xl border bg-necl-surface p-6 cursor-pointer transition-all
                    ${color} ${bgGlow}
                  `}
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${avatarColors[role]} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-necl-text">{roleData.name}</p>
                      <p className="text-[10px] text-necl-muted mt-0.5">{roleData.label}</p>
                    </div>
                  </div>

                  {/* Role icon */}
                  <Icon className="w-6 h-6 text-necl-muted mb-3" />

                  {/* Description */}
                  <p className="text-[11px] text-necl-muted leading-relaxed mb-5">
                    {roleData.description}
                  </p>

                  {/* Enter button */}
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-necl-bg border border-necl-border hover:bg-necl-accent hover:border-necl-accent hover:text-white text-necl-muted text-xs font-semibold transition-all">
                    Enter
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-necl-muted mt-8"
        >
          Powered by Navayuga AI · Data grounded in live project systems ·
          <span className="text-necl-warning ml-1">AI outputs require human verification</span>
        </motion.p>
      </div>
    </div>
  )
}
