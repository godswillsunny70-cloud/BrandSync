import React, { useState } from 'react';
import { Brand, Platform, FlagPattern } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { BrandKnowledgeVault } from './BrandKnowledgeVault.tsx';
import {
  Sparkles,
  Save,
  Trash2,
  Plus,
  PenTool,
  Check,
  Download,
  Upload,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  MapPin,
  Globe
} from 'lucide-react';

interface VoicesViewProps {
  brands: Brand[];
  activeBrand: Brand | null;
  onSaveBrand: (brand: Brand) => void;
  onDeleteBrand: (brandId: string) => void;
  onSelectBrand: (brandId: string) => void;
  onNavigateTab: (tab: string) => void;
  onImportBrands?: (imported: Brand[]) => void;
}

const ALL_PLATFORMS: Platform[] = [
  'Instagram',
  'TikTok',
  'LinkedIn',
  'X',
  'Facebook',
  'YouTube Shorts',
];

const COLOR_PALETTES = [
  '#14273A', // Ink
  '#D9432B', // Signal Red
  '#E8B422', // Sail Gold
  '#1E6F78', // Deep Teal
  '#FBFBF8', // Sail Bone
  '#7A3E8E', // Maritime Violet
  '#2D5A27', // Pine Green
  '#E07A5F', // Terra Cotta
];

const FLAG_PATTERNS: { id: FlagPattern; label: string }[] = [
  { id: 'split', label: 'Split Vertical' },
  { id: 'stripe', label: 'Horizontal Stripe' },
  { id: 'diag', label: 'Diagonal Pennant' },
  { id: 'cross', label: 'Naval Cross' },
];

export const VoicesView: React.FC<VoicesViewProps> = ({
  brands,
  activeBrand,
  onSaveBrand,
  onDeleteBrand,
  onSelectBrand,
  onNavigateTab,
  onImportBrands,
}) => {
  const [formData, setFormData] = useState<Brand>(() => {
    return (
      activeBrand || {
        id: 'b-' + Math.random().toString(36).slice(2, 9),
        name: '',
        industry: '',
        voice: '',
        dos: '',
        donts: '',
        samples: '',
        platforms: ['Instagram', 'LinkedIn'],
        flag: { a: '#14273A', b: '#E8B422', p: 'split' },
      }
    );
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isEditingExisting = brands.some((b) => b.id === formData.id);

  function handleSelectExisting(b: Brand) {
    setFormData(JSON.parse(JSON.stringify(b)));
    onSelectBrand(b.id);
    setConfirmDelete(false);
    setSaveSuccess(false);
  }

  function handleNewClientClick() {
    const fresh: Brand = {
      id: 'b-' + Math.random().toString(36).slice(2, 9),
      name: '',
      industry: '',
      voice: '',
      dos: '',
      donts: '',
      samples: '',
      platforms: ['Instagram', 'LinkedIn'],
      flag: { a: '#14273A', b: '#E8B422', p: 'split' },
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFormData(fresh);
    setConfirmDelete(false);
    setSaveSuccess(false);
  }

  function handleTogglePlatform(plat: Platform) {
    const list = formData.platforms.includes(plat)
      ? formData.platforms.filter((p) => p !== plat)
      : [...formData.platforms, plat];
    setFormData({ ...formData, platforms: list });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please provide a Client Name.');
      return;
    }
    if (formData.platforms.length === 0) {
      alert('Select at least one social media platform.');
      return;
    }
    onSaveBrand(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function handleDelete() {
    if (formData.id) {
      onDeleteBrand(formData.id);
      setConfirmDelete(false);
    }
  }

  function handleExportVault() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(brands, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'halyard-brand-vault-export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportVault(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && onImportBrands) {
          onImportBrands(parsed);
          alert(`Successfully imported ${parsed.length} client brand vault(s)!`);
        }
      } catch (err) {
        alert('Failed to parse brand vault JSON file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEFEA] text-[#14273A] border border-[#CBD4CD] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B422]" />
            Center of Halyard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
            Brand Voice Vault
          </h1>
          <p className="text-[#5A6B7A] max-w-2xl text-sm sm:text-base leading-relaxed">
            The heart of the entire suite. Every post generated in Studio, repurposed long-form piece, calendar idea, and community reply pulls directly from the guidelines configured here.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleNewClientClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#E8B422]" />
            New Client
          </button>
          <button
            type="button"
            onClick={handleExportVault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] text-xs font-semibold text-[#14273A] transition"
            title="Export all brand voices to JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6B7A]" />
            Export Vault
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] text-xs font-semibold text-[#14273A] transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#5A6B7A]" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportVault}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Client Switcher Sidebar & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Selector List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#CBD4CD]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B7A]">
                Configured Clients ({brands.length})
              </span>
              <button
                onClick={handleNewClientClick}
                className="text-xs font-bold text-[#1E6F78] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {brands.length === 0 && (
                <div className="py-6 px-3 text-center text-xs text-[#5A6B7A] bg-white rounded-lg border border-dashed border-[#CBD4CD]">
                  No clients in vault yet. Fill out the form to add your first client.
                </div>
              )}
              {brands.map((b) => {
                const isSelected = b.id === formData.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectExisting(b)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-white border-[#14273A] ring-2 ring-[#E8B422] shadow-xs'
                        : 'bg-white/60 border-[#CBD4CD] hover:bg-white hover:border-[#14273A]'
                    }`}
                  >
                    <FlagBadge flag={b.flag} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-[#14273A] truncate font-heading">
                        {b.name}
                      </div>
                      <div className="text-xs text-[#5A6B7A] truncate">
                        {b.industry || 'No industry line'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Voice Tip Callout */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Social Director Pro-Tip
            </div>
            <p className="leading-relaxed">
              The <strong>"Never" (Guardrails)</strong> and <strong>"Sample Posts"</strong> fields have the biggest mathematical impact on tone. Paste 2-3 genuine past posts that your client's founder approved to anchor the vocabulary.
            </p>
          </div>
        </div>

        {/* Right Column: Comprehensive Vault Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSave}
            className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#CBD4CD]">
              <div className="flex items-center gap-3">
                <FlagBadge flag={formData.flag} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-[#14273A] font-heading">
                    {formData.name || 'New Client Voice'}
                  </h2>
                  <p className="text-xs text-[#5A6B7A]">
                    {isEditingExisting ? 'Edit client voice parameters' : 'Define new client persona'}
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Saved to Vault
                </div>
              )}
            </div>

            {/* Field: Client Name & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                  Client / Brand Name <span className="text-[#D9432B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Harbor & Pine Coffee"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                  What They Do <span className="text-xs font-normal text-[#5A6B7A] lowercase">(one line)</span>
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Specialty coffee roaster with 3 cafes & bean subscriptions"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
              </div>
            </div>

            {/* Field: Location & Website (Essential for Google Search Audits & Local Identity) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1E6F78]" />
                  Headquarters & Service Location
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Austin, TX, USA (or 'London, UK' / 'Global / Online')"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
                <span className="text-[11px] text-[#5A6B7A] mt-1 block">
                  Grounds Google Search audits to eliminate wrong identity & misinformation.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#1E6F78]" />
                  Official Website
                </label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g. https://harborpinecoffee.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
                <span className="text-[11px] text-[#5A6B7A] mt-1 block">
                  Used by web crawlers to verify official domain authority and offerings.
                </span>
              </div>
            </div>

            {/* Field: Voice Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                How They Sound (Voice Persona)
              </label>
              <textarea
                rows={3}
                value={formData.voice}
                onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                placeholder="e.g. Warm, a little dry, grounded. Talks like a friendly barista who loves the craft, not a marketer. Short sentences. Occasional dry pun, never two in one post."
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422] resize-y"
              />
            </div>

            {/* Dos and Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  Always (Rules & Mandates)
                </label>
                <textarea
                  rows={3}
                  value={formData.dos}
                  onChange={(e) => setFormData({ ...formData, dos: e.target.value })}
                  placeholder="e.g. Mention the roast date. Credit farmers by name. Keep line breaks clean. Celebrate morning rituals."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D9432B] mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D9432B] inline-block" />
                  Never (Banned Words & Guardrails)
                </label>
                <textarea
                  rows={3}
                  value={formData.donts}
                  onChange={(e) => setFormData({ ...formData, donts: e.target.value })}
                  placeholder="e.g. No emojis on LinkedIn. Never say 'artisanal'. No cheesy discount urgency. Never use em dashes."
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422] resize-y"
                />
              </div>
            </div>

            {/* Field: Sample Posts */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Sample Posts They Loved <span className="text-xs font-normal text-[#5A6B7A] lowercase">(paste 2-4 real posts)</span>
              </label>
              <textarea
                rows={5}
                value={formData.samples}
                onChange={(e) => setFormData({ ...formData, samples: e.target.value })}
                placeholder="Paste real past posts separated by blank lines. The AI calibrates cadence, vocabulary, and paragraph length from this."
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422] font-mono text-xs resize-y"
              />
            </div>

            {/* Field: Platforms */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-2">
                Active Social Media Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((plat) => {
                  const isChecked = formData.platforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => handleTogglePlatform(plat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                        isChecked
                          ? 'bg-[#14273A] text-white border-[#14273A]'
                          : 'bg-white text-[#5A6B7A] border-[#CBD4CD] hover:border-[#14273A]'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Heraldic Flag Customizer */}
            <div className="p-4 rounded-lg bg-white border border-[#CBD4CD] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14273A] block">
                    Client Signal Flag
                  </span>
                  <span className="text-xs text-[#5A6B7A]">
                    Custom identifier displayed across all tools and tabs
                  </span>
                </div>
                <FlagBadge flag={formData.flag} size="lg" />
              </div>

              {/* Patterns */}
              <div>
                <span className="text-[11px] font-semibold text-[#5A6B7A] uppercase tracking-wider block mb-1.5">
                  Pattern
                </span>
                <div className="flex flex-wrap gap-2">
                  {FLAG_PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          flag: { ...formData.flag, p: pat.id },
                        })
                      }
                      className={`px-2.5 py-1 rounded text-xs border font-medium flex items-center gap-1.5 transition ${
                        formData.flag.p === pat.id
                          ? 'bg-[#14273A] text-white border-[#14273A]'
                          : 'bg-[#FBFBF8] text-[#14273A] border-[#CBD4CD] hover:border-[#14273A]'
                      }`}
                    >
                      <FlagBadge flag={{ a: formData.flag.a, b: formData.flag.b, p: pat.id }} size="sm" />
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary & Secondary Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#5A6B7A] uppercase tracking-wider block mb-1.5">
                    Primary Color
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PALETTES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            flag: { ...formData.flag, a: c },
                          })
                        }
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border transition ${
                          formData.flag.a === c
                            ? 'ring-2 ring-offset-2 ring-[#14273A] scale-110'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#5A6B7A] uppercase tracking-wider block mb-1.5">
                    Accent Color
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PALETTES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            flag: { ...formData.flag, b: c },
                          })
                        }
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border transition ${
                          formData.flag.b === c
                            ? 'ring-2 ring-offset-2 ring-[#14273A] scale-110'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Knowledge & Asset Vault (Files, Images, Videos) */}
            <BrandKnowledgeVault
              brand={formData}
              onSaveBrand={(updated) => setFormData(updated)}
            />

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-[#CBD4CD] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {isEditingExisting ? 'Save Changes' : 'Create Client Vault'}
                </button>

                {isEditingExisting && (
                  <button
                    type="button"
                    onClick={() => {
                      onSaveBrand(formData);
                      onNavigateTab('studio');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] text-xs font-semibold transition"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#E8B422]" />
                    Write Posts in this Voice
                  </button>
                )}
              </div>

              {isEditingExisting && (
                <div>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-300">
                      <span className="text-xs text-red-800 font-semibold">Confirm delete?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-2.5 py-1 rounded bg-[#D9432B] text-white text-xs font-bold hover:bg-red-700 transition"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-1 rounded bg-white text-xs text-[#5A6B7A] border hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 text-xs text-[#D9432B] hover:text-red-800 font-semibold px-3 py-2 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Client
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
