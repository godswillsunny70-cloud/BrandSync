import React, { useState, useRef } from 'react';
import { Brand, BrandAsset } from '../types.ts';
import { analyzeBrandAsset } from '../lib/api.ts';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  FileSpreadsheet,
  Tag,
  ShieldCheck,
  Loader2,
  Plus,
  Layers,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface BrandKnowledgeVaultProps {
  brand: Brand;
  onSaveBrand: (updatedBrand: Brand) => void;
  compact?: boolean;
}

export const BrandKnowledgeVault: React.FC<BrandKnowledgeVaultProps> = ({
  brand,
  onSaveBrand,
  compact = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'document' | 'image' | 'video'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets = brand.assets || [];

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const filteredAssets = assets.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAssets: BrandAsset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let assetType: 'image' | 'video' | 'document' = 'document';
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) {
        assetType = 'image';
      } else if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(extension)) {
        assetType = 'video';
      }

      // Read content for text-based or data url for media
      let contentSnippet = '';
      let fileUrl = '';

      try {
        if (assetType === 'image' || assetType === 'video') {
          fileUrl = await readFileAsDataUrl(file);
          contentSnippet = `Media asset: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type: ${file.type || extension})`;
        } else {
          // Document: try reading text
          if (['txt', 'md', 'csv', 'json'].includes(extension) || file.type.includes('text')) {
            contentSnippet = await readFileAsText(file);
          } else {
            // PDF or binary doc
            fileUrl = await readFileAsDataUrl(file);
            contentSnippet = `Document file: ${file.name} (${(file.size / 1024).toFixed(1)} KB, format: ${extension.toUpperCase()})`;
          }
        }
      } catch (err) {
        console.warn('File read warning:', err);
      }

      const assetId = 'ast-' + Math.random().toString(36).slice(2, 9);
      const newAsset: BrandAsset = {
        id: assetId,
        name: file.name,
        type: assetType,
        fileType: extension,
        url: fileUrl || undefined,
        size: file.size,
        uploadedAt: new Date().toISOString().split('T')[0],
        contentSnippet: contentSnippet ? contentSnippet.slice(0, 4000) : undefined,
        summary: `Brand asset covering ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}.`,
        tags: [
          assetType === 'image' ? 'Visual Asset' : assetType === 'video' ? 'Video Proof' : 'Brand Guideline',
          extension.toUpperCase(),
        ],
      };

      newAssets.push(newAsset);
    }

    const updatedBrand: Brand = {
      ...brand,
      assets: [...assets, ...newAssets],
    };

    onSaveBrand(updatedBrand);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`Added ${newAssets.length} asset${newAssets.length > 1 ? 's' : ''} to Brand Vault!`);

    // Auto-analyze first added asset if text snippet is available
    if (newAssets.length > 0) {
      triggerAiAnalysis(newAssets[0], updatedBrand);
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  }

  async function triggerAiAnalysis(asset: BrandAsset, currentBrand: Brand = brand) {
    setAnalyzingId(asset.id);
    try {
      const result = await analyzeBrandAsset({
        name: asset.name,
        type: asset.type,
        contentSnippet: asset.contentSnippet,
        brandName: currentBrand.name,
      });

      const updatedAssets = (currentBrand.assets || []).map((a) => {
        if (a.id === asset.id) {
          return {
            ...a,
            summary: result.summary,
            tags: result.tags?.length ? result.tags : a.tags,
          };
        }
        return a;
      });

      onSaveBrand({
        ...currentBrand,
        assets: updatedAssets,
      });
      showToast(`AI distilled core brand intelligence from "${asset.name}"`);
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setAnalyzingId(null);
    }
  }

  function handleDeleteAsset(assetId: string) {
    const updated = assets.filter((a) => a.id !== assetId);
    onSaveBrand({
      ...brand,
      assets: updated,
    });
    showToast('Asset removed from Brand Vault.');
  }

  function handleLoadSampleAssets() {
    const samples: BrandAsset[] = [
      {
        id: 'ast-sample-1',
        name: `${brand.name || 'Brand'}_Voice_and_Positioning_Guide.pdf`,
        type: 'document',
        fileType: 'pdf',
        size: 245000,
        uploadedAt: new Date().toISOString().split('T')[0],
        summary: `Core positioning and brand guidelines for ${brand.name || 'our brand'}. Mandates conversational warmth, transparent ingredient sourcing, and clear low-friction CTAs.`,
        tags: ['Brand Voice', 'Voice Guide', 'Positioning'],
        contentSnippet: `BRAND GUIDELINES SUMMARY:\n1. Core Persona: Friendly specialist who explains craft plainly.\n2. Non-negotiables: Never use corporate jargon or fake countdown timers.\n3. Primary CTA: Direct community engagement and saveable checklists.`,
      },
      {
        id: 'ast-sample-2',
        name: `${brand.name || 'Product'}_Hero_Craft_Visual.jpg`,
        type: 'image',
        fileType: 'jpg',
        size: 580000,
        uploadedAt: new Date().toISOString().split('T')[0],
        summary: 'High-contrast studio photography of flagship product craft in natural morning lighting.',
        tags: ['Product Shot', 'Visual Identity', 'Hero Media'],
        contentSnippet: 'Visual reference: Warm timber backdrop, natural daylight, unedited texture demonstrating artisanal quality.',
      },
      {
        id: 'ast-sample-3',
        name: 'Client_Transformation_14Day_Case_Study.md',
        type: 'document',
        fileType: 'md',
        size: 18400,
        uploadedAt: new Date().toISOString().split('T')[0],
        summary: 'Customer case study proving 40% reduction in friction and 2.4x higher retention in 14 days.',
        tags: ['Case Study', 'Social Proof', 'Conversion Angle'],
        contentSnippet: 'CASE STUDY:\nSubject: Overhauling community friction.\nResult: 2.4x retention increase.\nKey Quote: "The only strategy that did not require bloated software."',
      },
    ];

    onSaveBrand({
      ...brand,
      assets: [...assets, ...samples],
    });
    showToast('Loaded 3 sample brand collateral assets!');
  }

  return (
    <div className={`space-y-4 ${compact ? '' : 'bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-7 shadow-xs'}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14273A] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2 border border-[#E8B422] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#E8B422]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBD4CD]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#14273A] font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1E6F78]" />
              Brand Knowledge & Asset Vault
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#14273A] text-white text-[11px] font-bold">
              {assets.length} {assets.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-[#5A6B7A]">
            Upload files, PDFs, guidelines, images, or videos. Your AI Agent, Content Studio, and Audits automatically learn from these assets to speak with 100% brand truth.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {assets.length === 0 && (
            <button
              type="button"
              onClick={handleLoadSampleAssets}
              className="px-3 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-[#EAEFEA] text-[#14273A] text-xs font-semibold transition"
            >
              + Load Starter Pack
            </button>
          )}

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white text-xs font-bold transition cursor-pointer shadow-xs">
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Upload Collateral</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md,.csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Agent Sync Banner */}
      <div className="p-3 rounded-lg bg-[#EAEFEA] border border-[#CBD4CD] flex items-center justify-between text-xs text-[#14273A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>AI Intelligence Hub:</strong> All {assets.length} uploaded brand documents & media are actively injected into the SMM Director Agent and Copywriter engines.
          </span>
        </div>
        <div className="text-[11px] font-bold text-[#1E6F78] uppercase tracking-wider shrink-0 hidden sm:block">
          Auto-Synced
        </div>
      </div>

      {/* Filter Tabs */}
      {assets.length > 0 && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                filterType === 'all'
                  ? 'bg-[#14273A] text-white'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:border-[#14273A]'
              }`}
            >
              All ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('document')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                filterType === 'document'
                  ? 'bg-[#14273A] text-white'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:border-[#14273A]'
              }`}
            >
              <FileText className="w-3 h-3" />
              Documents ({assets.filter((a) => a.type === 'document').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('image')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                filterType === 'image'
                  ? 'bg-[#14273A] text-white'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:border-[#14273A]'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              Images ({assets.filter((a) => a.type === 'image').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('video')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                filterType === 'video'
                  ? 'bg-[#14273A] text-white'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:border-[#14273A]'
              }`}
            >
              <VideoIcon className="w-3 h-3" />
              Videos ({assets.filter((a) => a.type === 'video').length})
            </button>
          </div>
        </div>
      )}

      {/* Asset Cards Grid */}
      {assets.length === 0 ? (
        <div className="border-2 border-dashed border-[#CBD4CD] rounded-xl p-8 text-center space-y-3 bg-white">
          <div className="w-12 h-12 rounded-full bg-[#EAEFEA] text-[#1E6F78] mx-auto flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-[#14273A]">
              No brand assets uploaded yet
            </h4>
            <p className="text-xs text-[#5A6B7A]">
              Drop PDF guides, client decks, photography, product specs, or past top-performing captions to strengthen what your AI agent knows about <strong>{brand.name || 'this brand'}</strong>.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleLoadSampleAssets}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#14273A] hover:bg-[#EAEFEA] text-xs font-bold text-[#14273A] transition"
            >
              Load Sample Brand Files
            </button>
            <label className="px-3.5 py-2 rounded-lg bg-[#14273A] hover:bg-[#1E364E] text-white text-xs font-bold transition cursor-pointer">
              Choose Files to Upload
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md,.csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const isAnalyzing = analyzingId === asset.id;
            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border-2 border-[#14273A] p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition"
              >
                <div className="space-y-2.5">
                  {/* Top line: icon, name, badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#EAEFEA] text-[#1E6F78] flex items-center justify-center shrink-0 border border-[#CBD4CD]">
                        {asset.type === 'image' ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : asset.type === 'video' ? (
                          <VideoIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="font-bold text-xs text-[#14273A] truncate font-heading"
                          title={asset.name}
                        >
                          {asset.name}
                        </h4>
                        <div className="text-[10px] text-[#5A6B7A] flex items-center gap-1.5">
                          <span>{asset.fileType?.toUpperCase()}</span>
                          {asset.size && (
                            <>
                              <span>•</span>
                              <span>{(asset.size / 1024).toFixed(0)} KB</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{asset.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-slate-400 hover:text-[#D9432B] p-1 rounded transition"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Media Preview thumbnail if available */}
                  {asset.type === 'image' && asset.url && (
                    <div
                      onClick={() => setPreviewAsset(asset)}
                      className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-[#CBD4CD] group"
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                    </div>
                  )}

                  {asset.type === 'video' && asset.url && (
                    <div className="rounded-lg overflow-hidden border border-[#CBD4CD] bg-black">
                      <video
                        src={asset.url}
                        controls
                        className="w-full h-28 object-cover"
                      />
                    </div>
                  )}

                  {/* Summary / Extracted AI Knowledge */}
                  {asset.summary && (
                    <p className="text-xs text-[#14273A] bg-[#FBFBF8] p-2.5 rounded-lg border border-[#CBD4CD] leading-relaxed">
                      {asset.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAEFEA] text-[#1E6F78] border border-[#CBD4CD]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="pt-2 border-t border-[#CBD4CD] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Agent Loaded
                  </span>

                  <div className="flex items-center gap-1.5">
                    {asset.contentSnippet && (
                      <button
                        type="button"
                        onClick={() => setPreviewAsset(asset)}
                        className="text-[#14273A] hover:underline text-[11px] font-semibold"
                      >
                        Inspect
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => triggerAiAnalysis(asset)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#D9432B] hover:text-[#C03720] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 transition"
                      title="Re-run AI extraction"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          AI Distill
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border-2 border-[#14273A] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#CBD4CD] flex items-center justify-between bg-[#FBFBF8]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1E6F78]" />
                <h3 className="font-bold text-sm text-[#14273A] font-heading truncate max-w-md">
                  {previewAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1 rounded text-[#5A6B7A] hover:text-[#14273A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {previewAsset.type === 'image' && previewAsset.url && (
                <div className="text-center bg-slate-50 p-2 rounded-lg border border-[#CBD4CD]">
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    className="max-h-72 mx-auto rounded object-contain"
                  />
                </div>
              )}

              {previewAsset.summary && (
                <div className="p-3 bg-[#EAEFEA] rounded-lg border border-[#CBD4CD] space-y-1">
                  <div className="font-bold text-[#14273A] text-xs">AI Distilled Knowledge:</div>
                  <p className="text-[#5A6B7A] leading-relaxed">{previewAsset.summary}</p>
                </div>
              )}

              {previewAsset.contentSnippet && (
                <div className="space-y-1">
                  <div className="font-bold text-[#14273A] uppercase tracking-wider text-[11px]">
                    Extracted Text / Document Content:
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono whitespace-pre-wrap max-h-60">
                    {previewAsset.contentSnippet}
                  </pre>
                </div>
              )}

              {previewAsset.tags && previewAsset.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#5A6B7A] text-[11px]">Associated Tags:</span>
                  {previewAsset.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#CBD4CD] bg-[#FBFBF8] flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-1.5 rounded-lg bg-[#14273A] text-white font-bold text-xs hover:bg-[#1E364E]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
