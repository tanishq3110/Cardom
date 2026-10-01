import { useState, useEffect } from 'react'
import { PartnerLayout } from '@/components/PartnerLayout'
import {
  Building2, Mail, Phone, MapPin, User, Pencil, Check, X,
  ShieldCheck, Clock, FileBadge, Loader2, AlertCircle, Hash,
  Tag, QrCode, Upload, Eye, Smartphone, Trash2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { CATEGORY_LABELS } from '@/lib/constants'
import { updatePartnerProfile, calcProfileCompletion } from '@/services/partnerProfileApi'
import { readQrImageFileAsDataUrl } from '@/services/partnerPaymentApi'
import { buildUpiUri, generateQrDataUrl } from '@/utils/upiQr'

function InfoRow({ icon: Icon, label, value, field, placeholder, editing, form, setForm, type = 'text' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#2A2A2A] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest mb-0.5">{label}</p>
        {editing && field ? (
          <input
            type={type}
            value={form[field] || ''}
            placeholder={placeholder || label}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            className="w-full text-sm text-white bg-[#202020] border border-[#333] rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
          />
        ) : (
          <p className="text-sm text-white break-words">{value || '—'}</p>
        )}
      </div>
    </div>
  )
}

function CompletionBar({ percent }) {
  const color = percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#A1A1AA]">Profile Completion</span>
        <span className="text-xs font-bold text-white">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#2A2A2A]">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function PartnerProfile() {
  const { user, partnerProfile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [previewQrModal, setPreviewQrModal] = useState(null) // { src: string, title: string, subtitle: string }

  const [form, setForm] = useState({
    business_name: '',
    authorized_contact_name: '',
    phone: '',
    registration_number: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    upi_id: '',
    upi_qr_url: '',
  })

  useEffect(() => {
    if (partnerProfile) {
      setForm({
        business_name: partnerProfile.business_name || '',
        authorized_contact_name: partnerProfile.authorized_contact_name || '',
        phone: partnerProfile.phone || '',
        registration_number: partnerProfile.registration_number || '',
        gstin: partnerProfile.gstin || '',
        address: partnerProfile.address || '',
        city: partnerProfile.city || '',
        state: partnerProfile.state || '',
        pincode: partnerProfile.pincode || '',
        upi_id: partnerProfile.upi_id || '',
        upi_qr_url: partnerProfile.upi_qr_url || '',
      })
    }
  }, [partnerProfile])

  const handleSave = async () => {
    setSaving(true)
    setStatusMessage(null)
    const { error } = await updatePartnerProfile(form)
    if (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Failed to save profile.' })
    } else {
      await refreshProfile()
      setEditing(false)
      setStatusMessage({ type: 'success', text: 'Profile saved successfully.' })
      setTimeout(() => setStatusMessage(null), 4000)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (partnerProfile) {
      setForm({
        business_name: partnerProfile.business_name || '',
        authorized_contact_name: partnerProfile.authorized_contact_name || '',
        phone: partnerProfile.phone || '',
        registration_number: partnerProfile.registration_number || '',
        gstin: partnerProfile.gstin || '',
        address: partnerProfile.address || '',
        city: partnerProfile.city || '',
        state: partnerProfile.state || '',
        pincode: partnerProfile.pincode || '',
        upi_id: partnerProfile.upi_id || '',
        upi_qr_url: partnerProfile.upi_qr_url || '',
      })
    }
    setEditing(false)
  }

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readQrImageFileAsDataUrl(file)
      setForm((prev) => ({ ...prev, upi_qr_url: dataUrl }))
      setStatusMessage({ type: 'success', text: 'UPI QR code uploaded. Click Save to apply.' })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to read QR image' })
    }
  }

  const handleGenerateAndPreviewDynamicQr = async () => {
    if (!form.upi_id) {
      setStatusMessage({ type: 'error', text: 'Please enter a UPI ID first to generate QR preview.' })
      return
    }
    const uri = buildUpiUri({
      upiId: form.upi_id,
      payeeName: form.business_name || 'Cardom Partner',
      amount: 250,
      note: 'Ride Fare Preview',
    })
    const qrDataUrl = await generateQrDataUrl(uri)
    if (qrDataUrl) {
      setPreviewQrModal({
        src: qrDataUrl,
        title: 'Dynamic UPI QR Preview',
        subtitle: `Locked to ₹250.00 (${form.upi_id})`,
      })
    }
  }

  const isVerified = partnerProfile?.is_verified ?? false
  const accountStatus = partnerProfile?.status || 'pending'
  const category = partnerProfile?.partner_category || ''
  const displayCategory = CATEGORY_LABELS[category] || category
  const email = partnerProfile?.email || user?.email || ''
  const completion = calcProfileCompletion(partnerProfile)

  const STATUS_BADGE = {
    active:    'bg-green-500/15 text-green-400 border-green-500/30',
    pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    suspended: 'bg-red-500/15 text-red-400 border-red-500/30',
    rejected:  'bg-red-500/15 text-red-400 border-red-500/30',
  }

  return (
    <PartnerLayout title="Profile" subtitle="Business details and accreditation">
      <div className="px-4 sm:px-6 py-6 space-y-4 max-w-3xl">

        {/* Toast */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1">{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Verification Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          isVerified ? 'border-green-500/30 bg-green-500/10' : 'border-amber-500/30 bg-amber-500/10'
        }`}>
          <div className="flex items-center gap-3">
            {isVerified
              ? <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              : <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${
                isVerified ? 'text-green-300' : 'text-amber-300'
              }`}>
                {isVerified ? 'Partner Verified' : 'Verification Pending'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isVerified
                  ? 'Your business credentials have been verified by Cardom.'
                  : 'Business documents are under review. All dashboard features remain active.'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border capitalize ${
            STATUS_BADGE[accountStatus] || STATUS_BADGE.pending
          }`}>
            {accountStatus}
          </span>
        </div>

        {/* Business Header */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
            <span className="text-black font-black text-2xl">
              {form.business_name?.[0]?.toUpperCase() || 'P'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">{form.business_name || 'Your Business'}</h2>
              {isVerified && <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/25">
                {displayCategory || 'Partner'}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1.5 font-mono">
              ID: {user?.id ? `${user.id.slice(0, 8)}…${user.id.slice(-4)}` : '—'}
            </p>
          </div>
          {/* Edit / Save / Cancel buttons */}
          {editing ? (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-[#202020] border border-[#2A2A2A] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto p-2 rounded-lg bg-[#202020] border border-[#2A2A2A] hover:border-orange-500/40 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Completion */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5">
          <CompletionBar percent={completion} />
          {completion < 100 && (
            <p className="text-[11px] text-[#555] mt-2">
              Complete your profile to improve lead matching and partner visibility.
            </p>
          )}
        </div>

        {/* ── Payment Settings (Direct UPI) ── */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-400" />
                Payment Settings (Direct UPI)
              </p>
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                This UPI ID and QR will be shown to customers for direct payment during rides.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <InfoRow
              icon={Smartphone}
              label="UPI ID (VPA)"
              field="upi_id"
              value={form.upi_id}
              editing={editing}
              form={form}
              setForm={setForm}
              placeholder="e.g. apexmotorworks@upi or 9876543210@paytm"
            />

            {/* QR Upload & Preview Section */}
            <div className="pt-2 border-t border-[#2A2A2A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#A1A1AA] uppercase font-mono tracking-widest">Driver UPI QR Code</span>
                {form.upi_qr_url && (
                  <button
                    onClick={() => setPreviewQrModal({
                      src: form.upi_qr_url,
                      title: 'Partner Static QR',
                      subtitle: form.business_name || 'Apex Motor Works',
                    })}
                    className="text-xs text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Uploaded QR
                  </button>
                )}
              </div>

              {form.upi_qr_url ? (
                <div className="flex items-center gap-3 bg-[#202020] p-3 rounded-xl border border-[#2A2A2A]">
                  <img
                    src={form.upi_qr_url}
                    alt="UPI QR Code"
                    className="w-14 h-14 object-contain rounded-lg bg-white p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">Custom QR Uploaded</p>
                    <p className="text-[11px] text-zinc-400 truncate">Will be presented to customer upon ride completion</p>
                  </div>
                  {editing && (
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, upi_qr_url: '' }))}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                      title="Remove QR"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No custom QR uploaded. Customers will scan dynamic QR generated from your UPI ID.</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {editing && (
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] text-xs font-semibold text-white cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
                    Upload QR Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {form.upi_id && (
                  <button
                    type="button"
                    onClick={handleGenerateAndPreviewDynamicQr}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-xs font-semibold text-orange-400 hover:bg-orange-500/25 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Preview Dynamic QR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl px-5 py-2">
          <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">Business Information</p>
          <InfoRow icon={Building2} label="Business Name" field="business_name" value={form.business_name} editing={editing} form={form} setForm={setForm} placeholder="Your business name" />
          <InfoRow icon={User} label="Authorized Contact Person" field="authorized_contact_name" value={form.authorized_contact_name} editing={editing} form={form} setForm={setForm} placeholder="Full name of authorized contact" />
          <InfoRow icon={Tag} label="Partner Category" value={displayCategory || '—'} editing={false} form={form} setForm={setForm} />
          <InfoRow icon={FileBadge} label="Registration Number" field="registration_number" value={form.registration_number} editing={editing} form={form} setForm={setForm} placeholder="Business registration number" />
          <InfoRow icon={Hash} label="GSTIN" field="gstin" value={form.gstin} editing={editing} form={form} setForm={setForm} placeholder="GST identification number" />
        </div>

        {/* Contact */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl px-5 py-2">
          <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">Contact</p>
          <InfoRow icon={Phone} label="Phone" field="phone" value={form.phone} editing={editing} form={form} setForm={setForm} placeholder="+91 XXXXX XXXXX" type="tel" />
          <InfoRow icon={Mail} label="Email" value={email} editing={false} form={form} setForm={setForm} />
        </div>

        {/* Address */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl px-5 py-2">
          <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider py-3 border-b border-[#2A2A2A]">Address</p>
          <InfoRow icon={MapPin} label="Street Address" field="address" value={form.address} editing={editing} form={form} setForm={setForm} placeholder="Street, Area, Landmark" />
          <InfoRow icon={MapPin} label="City" field="city" value={form.city} editing={editing} form={form} setForm={setForm} placeholder="City" />
          <InfoRow icon={MapPin} label="State" field="state" value={form.state} editing={editing} form={form} setForm={setForm} placeholder="State" />
          <InfoRow icon={MapPin} label="Pincode" field="pincode" value={form.pincode} editing={editing} form={form} setForm={setForm} placeholder="6-digit pincode" />
        </div>

      </div>

      {/* QR Preview Modal */}
      {previewQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewQrModal(null)}
        >
          <div
            className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-bold text-white">{previewQrModal.title}</h3>
              <button
                onClick={() => setPreviewQrModal(null)}
                className="w-7 h-7 rounded-full bg-[#242424] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <img
                src={previewQrModal.src}
                alt="QR Preview"
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <p className="text-xs text-[#A1A1AA] font-mono break-all">{previewQrModal.subtitle}</p>

            <button
              onClick={() => setPreviewQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </PartnerLayout>
  )
}
