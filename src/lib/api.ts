import { 
  Brand, 
  StudioVersion, 
  RepurposeResult, 
  AnalyzedReplyItem, 
  AuditResult, 
  TrendsResponse, 
  InsightsResult,
  ChatMessage,
  LinkInspectionResult,
  VisualEngine,
  VisualFormat,
  VisualAspectRatio,
  GeneratedAIVisual
} from '../types.ts';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = 'Request failed with status ' + res.status;
    try {
      const data = await res.json();
      if (data.error) errMessage = data.error;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }
  return res.json() as Promise<T>;
}

export async function generateStudioPosts(payload: {
  brand: Brand;
  topic: string;
  goal?: string;
  platforms: string[];
  versionsCount?: number;
  formula?: string;
  angle?: string;
  journeyStage?: string;
}): Promise<{ posts: StudioVersion[] }> {
  const res = await fetch('/api/brand-generate-studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function repurposeContent(payload: {
  brand: Brand;
  sourceText: string;
  formula?: string;
  angle?: string;
  journeyStage?: string;
}): Promise<RepurposeResult> {
  const res = await fetch('/api/brand-repurpose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function draftReplies(payload: {
  brand: Brand;
  messages: string[];
  tone?: string;
  context?: string;
}): Promise<{ analyzed: AnalyzedReplyItem[] }> {
  const res = await fetch('/api/brand-replies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function draftCalendar(payload: {
  brand: Brand;
  dates: string[];
  existingPosts?: any[];
  themeOrGoal?: string;
}): Promise<{ calendar: any[] }> {
  const res = await fetch('/api/brand-calendar-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function inspectAccountLink(payload: {
  accountUrl: string;
}): Promise<LinkInspectionResult> {
  const res = await fetch('/api/inspect-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function runAccountAudit(payload: {
  accountUrl: string;
  platform?: string;
  brandName?: string;
  location?: string;
  website?: string;
  notes?: string;
  bioText?: string;
  niche?: string;
  contentSamples?: string;
  followerRange?: string;
  brand?: Brand;
  enableSearchGrounding?: boolean;
}): Promise<AuditResult> {
  const res = await fetch('/api/account-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function analyzeBrandAsset(payload: {
  name: string;
  type: string;
  contentSnippet?: string;
  mimeType?: string;
  base64?: string;
  brandName?: string;
}): Promise<{ summary: string; tags: string[]; keyAngles: string[] }> {
  const res = await fetch('/api/brand-asset-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchSocialTrends(payload: {
  platform?: string;
  industry?: string;
  brand?: Brand;
}): Promise<TrendsResponse> {
  const res = await fetch('/api/social-trends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function analyzeInsights(payload: {
  brand: Brand;
  metricsText: string;
  additionalNote?: string;
}): Promise<InsightsResult> {
  const res = await fetch('/api/brand-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function askSmmAssistant(payload: {
  brand: Brand;
  message: string;
  chatHistory: ChatMessage[];
}): Promise<{ reply: string }> {
  const res = await fetch('/api/smm-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function generateAIVisual(payload: {
  engine?: VisualEngine;
  format?: VisualFormat;
  prompt?: string;
  hook?: string;
  caption?: string;
  topic?: string;
  brand?: Brand;
  aspectRatio?: VisualAspectRatio;
  stylePreset?: string;
}): Promise<GeneratedAIVisual> {
  const res = await fetch('/api/generate-visual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
