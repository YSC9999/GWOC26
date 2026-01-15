"use client";
import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import Link from "next/link";

interface VisitingHours {
  monday?: string; tuesday?: string; wednesday?: string; thursday?: string;
  friday?: string; saturday?: string; sunday?: string;
}

interface StudioInfoPayload {
  name?: string;
  tagline?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  mapUrl?: string;
  mapLink?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  visitingHours?: VisitingHours;
  visitPolicy?: string;
  collectionPolicy?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  aboutText?: string;
}

export default function AdminContact() {
  const [studio, setStudio] = useState<StudioInfoPayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const [errorSections, setErrorSections] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudio();
  }, []);

  const fetchStudio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studio', { credentials: 'same-origin' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText || 'Failed to fetch');
      }
      const data = await res.json();
      setStudio(data.studioInfo || {});
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (keys: string[], sectionName: string) => {
    setSavingSections((s) => ({ ...s, [sectionName]: true }));
    setError("");
    setErrorSections((s) => ({ ...s, [sectionName]: "" }));
    try {
      const payload: any = {};
      keys.forEach((k) => {
        if (k === 'visitingHours') {
          payload[k] = studio.visitingHours || {};
        } else {
          // @ts-ignore
          payload[k] = studio[k];
        }
      });

      const res = await fetch('/api/admin/studio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setStudio(data.studioInfo);
      setSavedSections((s) => ({ ...s, [sectionName]: true }));
      setTimeout(() => setSavedSections((s) => ({ ...s, [sectionName]: false })), 2500);
    } catch (err: any) {
      setError(err.message);
      setErrorSections((s) => ({ ...s, [sectionName]: err.message }));
    } finally {
      setSavingSections((s) => ({ ...s, [sectionName]: false }));
    }
  };

  const handleChange = (key: string, value: any) => {
    setStudio((s) => ({ ...s, [key]: value }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setStudio((s) => ({ ...s, visitingHours: { ...(s.visitingHours || {}), [day]: value } }));
  };

  const handleSave = async () => {
    // Save everything at once using saveSection helper
    setSaving(true);
    setSaved(false);
    setError("");
    await saveSection([
      'name', 'tagline', 'aboutText', 'phone', 'email', 'whatsapp',
      'address', 'city', 'state', 'pincode', 'mapUrl', 'mapLink', 'visitingHours',
      'visitPolicy', 'collectionPolicy', 'instagram', 'facebook', 'youtube'
    ], 'all');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-soil/60 hover:text-clay">← Admin Home</Link>
        <h1 className="text-3xl font-serif font-bold text-soil">Company Details</h1>
      </div>

      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
          <strong>Error:</strong> {error}
          {error === 'Unauthorized' && (
            <span> — you need to <a href="/auth/login" className="underline text-clay">log in as an admin</a>.</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="p-8 bg-white rounded-xl text-center"><Loader2 className="animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Company info</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Studio name</label>
                <input value={studio.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tagline</label>
                <input value={studio.tagline || ''} onChange={(e) => handleChange('tagline', e.target.value)} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">About text</label>
                <textarea value={studio.aboutText || ''} onChange={(e) => handleChange('aboutText', e.target.value)} rows={4} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={studio.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Phone" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                <input value={studio.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                <input value={studio.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="Whatsapp" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => saveSection(['phone', 'email', 'whatsapp'], 'contact')} disabled={!!savingSections['contact']} className="text-sm bg-white border px-3 py-1 rounded-md">
                  {savingSections['contact'] ? 'Saving...' : 'Save Contact'}
                </button>
                {savedSections['contact'] && <div className="text-green-600 flex items-center gap-2 text-sm"><Check /> Saved</div>}
                {errorSections['contact'] && <div className="text-red-600 text-sm">{errorSections['contact']}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input value={studio.address || ''} onChange={(e) => handleChange('address', e.target.value)} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <input value={studio.city || ''} onChange={(e) => handleChange('city', e.target.value)} placeholder="City" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                  <input value={studio.state || ''} onChange={(e) => handleChange('state', e.target.value)} placeholder="State" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                  <input value={studio.pincode || ''} onChange={(e) => handleChange('pincode', e.target.value)} placeholder="Pincode" className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Google Maps Link (for buttons)</label>
                <input
                  value={studio.mapLink || ''}
                  onChange={(e) => handleChange('mapLink', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="input-field w-full px-3 py-2 rounded-md mb-3 text-base md:text-sm"
                />

                <label className="block text-sm font-medium mb-1">
                  Map Embed URL (for iframe display)
                  <span className="text-soil/50 font-normal text-xs ml-2">(Share {'>'} Embed a map {'>'} Copy HTML {'>'} Only the src part)</span>
                </label>
                <input
                  value={studio.mapUrl || ''}
                  onChange={(e) => handleChange('mapUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium mb-2">Visiting Hours</h3>
                  <div>
                    <button onClick={() => saveSection(['visitingHours'], 'hours')} disabled={!!savingSections['hours']} className="text-sm bg-white border px-3 py-1 rounded-md">
                      {savingSections['hours'] ? 'Saving...' : 'Save Hours'}
                    </button>
                    {savedSections['hours'] && <div className="inline-block ml-3 text-green-600 text-sm"><Check /> Saved</div>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <input key={day} value={(studio.visitingHours as any)?.[day] || ''} onChange={(e) => handleHoursChange(day, e.target.value)} placeholder={day} className="input-field px-3 py-2 rounded-md text-base md:text-sm" />
                  ))}
                </div>
                {errorSections['hours'] && <div className="text-red-600 mt-2">{errorSections['hours']}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Visit Policy</label>
                <textarea value={studio.visitPolicy || ''} onChange={(e) => handleChange('visitPolicy', e.target.value)} rows={3} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Collection Policy</label>
                <textarea value={studio.collectionPolicy || ''} onChange={(e) => handleChange('collectionPolicy', e.target.value)} rows={3} className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm" />
              </div>

              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => saveSection(['visitPolicy', 'collectionPolicy'], 'policies')} disabled={!!savingSections['policies']} className="text-sm bg-white border px-3 py-1 rounded-md">
                  {savingSections['policies'] ? 'Saving...' : 'Save Policies'}
                </button>
                {savedSections['policies'] && <div className="text-green-600 flex items-center gap-2 text-sm"><Check /> Saved</div>}
                {errorSections['policies'] && <div className="text-red-600 text-sm">{errorSections['policies']}</div>}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleSave} disabled={saving} className="bg-clay text-white px-6 py-2 rounded-full font-semibold disabled:opacity-60">
                  {saving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
                {saved && <div className="text-green-600 flex items-center gap-2"><Check /> Saved</div>}
                {error && <div className="text-red-600">{error}</div>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preview / Quick actions</h2>

            <div className="space-y-3 text-sm text-soil/70 mb-6">
              <div><strong>Address:</strong> {studio.address}</div>
              <div><strong>Phone:</strong> {studio.phone}</div>
              <div><strong>Email:</strong> {studio.email}</div>
            </div>

            <a target="_blank" rel="noreferrer" className="inline-block bg-clay text-white px-4 py-2 rounded-full" href={studio.mapLink || studio.mapUrl || '#'}>Open map</a>
          </div>
        </div>
      )}
    </div>
  );
}
