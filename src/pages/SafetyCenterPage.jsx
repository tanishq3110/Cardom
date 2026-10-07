import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  UserPlus,
  Trash2,
  Shield,
  AlertOctagon,
  HeartHandshake,
  CheckCircle2,
  Loader2,
  X,
  Users,
} from 'lucide-react'
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} from '@/services/rideSafetyApi'

const HELPLINE_NUMBERS = [
  { name: 'National Emergency', number: '112', desc: 'Police, Fire & Medical', icon: AlertOctagon, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { name: 'Police Control', number: '100', desc: 'City Police Dispatch', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'Ambulance Service', number: '102', desc: 'Emergency Medical Care', icon: HeartHandshake, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Women Helpline', number: '1091', desc: '24x7 Safety & Distress', icon: ShieldCheck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
]

export function SafetyCenterPage() {
  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'Family', isPrimary: false })

  const loadContacts = async () => {
    setLoading(true)
    const { data } = await getEmergencyContacts()
    setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return

    setSaving(true)
    await addEmergencyContact(form)
    setSaving(false)
    setShowAddModal(false)
    setForm({ name: '', phone: '', relationship: 'Family', isPrimary: false })
    loadContacts()
  }

  const handleDeleteContact = async (contactId) => {
    await deleteEmergencyContact(contactId)
    loadContacts()
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Cardom Safety Center</h1>
            <p className="text-xs text-emerald-400 font-medium">24/7 Monitored Ride Protection</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6 max-w-lg mx-auto">
        {/* Helpline Dialers */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            National Emergency Services
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {HELPLINE_NUMBERS.map((h) => {
              const Icon = h.icon
              return (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className={`p-3.5 rounded-2xl border ${h.color} flex flex-col justify-between transition-transform active:scale-95`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5" />
                    <Phone className="w-3.5 h-3.5 opacity-70" />
                  </div>
                  <div className="mt-4">
                    <span className="text-base font-black text-white block">{h.number}</span>
                    <span className="text-xs font-bold text-zinc-200 block mt-0.5">{h.name}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{h.desc}</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Trusted Emergency Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Trusted Emergency Contacts
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Alerted when you trigger emergency SOS during a ride
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/25 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-zinc-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] text-center space-y-2">
              <Users className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-300 font-semibold">No Emergency Contacts Added</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Add friends or family members who will receive immediate alerts in case of an emergency.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-[#141414] border border-[#242424] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{c.name}</span>
                      {c.is_primary && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{c.phone}</span>
                      <span>•</span>
                      <span>{c.relationship || 'Contact'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2 rounded-lg bg-[#222] text-zinc-300 hover:text-white"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cardom Ride Safety Standards */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-[#242424] space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cardom Ride Safety Features
          </h3>
          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Verified Drivers:</strong> Every Cardom partner driver is KYC verified with background checks.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Real-Time GPS Tracking:</strong> Your trip route and driver location are tracked live 24/7.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>In-Ride SOS Button:</strong> One-tap emergency dispatch sends your live coordinates to police & safety ops.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddContact}
            className="w-full max-w-sm rounded-2xl bg-[#161616] border border-[#2D2D2D] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add Emergency Contact</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#202020] border border-[#333] rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-[#202020] border border-[#333] rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Relationship</label>
                <select
                  value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  className="w-full bg-[#202020] border border-[#333] rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500"
                >
                  <option value="Family">Family</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="accent-orange-500"
                />
                <label htmlFor="isPrimary" className="text-zinc-300 cursor-pointer">
                  Set as primary emergency contact
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#222] text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
