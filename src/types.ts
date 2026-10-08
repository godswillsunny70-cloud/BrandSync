export type Platform = 'Instagram' | 'TikTok' | 'LinkedIn' | 'X' | 'Facebook' | 'YouTube Shorts';

export type PostStatus = 'idea' | 'draft' | 'scheduled' | 'posted';

export type FlagPattern = 'split' | 'stripe' | 'diag' | 'cross';

export interface BrandFlag {
  a: string;
  b: string;
  p: FlagPattern;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  fileType?: string; // e.g., 'png', 'jpg', 'pdf', 'mp4', 'txt'
  url?: string; // data URL or resource URL
  size?: number; // bytes
  summary?: string; // core angle / takeaways extracted
  tags?: string[]; // e.g. ['Brand Styleguide', 'Product Specs', 'Case Study']
  uploadedAt: string;
  contentSnippet?: string; // extracted text content
}

export interface Brand {
  id: string;
  name: string;
  industry: string;
  voice: string;
  dos: string;
  donts: string;
  samples: string;
  platforms: Platform[];
  flag: BrandFlag;
  website?: string;
  location?: string; // e.g. "Austin, TX", "London, UK", "Global / Remote"
  assets?: BrandAsset[]; // Uploaded files, images, videos for brand intelligence
  auditScore?: number;
  lastAuditDate?: string;
  createdAt?: string;
}

export type VisualEngine = 'nano-banana-2' | 'omni-1.1';
export type VisualFormat = 'image' | 'carousel' | 'motion' | 'animation';
export type VisualAspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

export interface VisualCarouselSlide {
  slideNumber: number;
  badge?: string;
  headline: string;
  subtext: string;
  bulletPoints?: string[];
  visualPrompt?: string;
  colorTheme?: string;
  layoutType?: 'hook-hero' | 'problem-contrast' | 'bento-grid' | 'step-framework' | 'cta-conversion';
}

export interface MotionGraphicKeyframe {
  timeSec: number;
  label: string;
  visualState: string;
}

export interface MotionGraphicConfig {
  headlineText: string;
  highlightWords: string[];
  sublineText: string;
  durationSeconds: number;
  animationStyle: 'kinetic-typography' | 'gradient-pulse' | 'elastic-pop' | 'cyber-shimmer' | 'editorial-float';
  backgroundTheme: 'deep-navy' | 'crimson-amber' | 'emerald-glass' | 'midnight-gold' | 'clean-mono';
  callToActionBadge: string;
  soundCue?: string;
  keyframes?: MotionGraphicKeyframe[];
}

export interface GeneratedAIVisual {
  id: string;
  engine: VisualEngine;
  format: VisualFormat;
  aspectRatio: VisualAspectRatio;
  title: string;
  promptUsed: string;
  stylePreset: string;
  engineBadge: string;
  engineSpecs?: {
    resolution: string;
    renderTime: string;
    aesthetic: string;
  };
  svgGraphic?: string;
  imageUrl?: string;
  imageAlt?: string;
  visualDirection?: string;
  carouselSlides?: VisualCarouselSlide[];
  motionConfig?: MotionGraphicConfig;
  hookAttached?: string;
  captionAttached?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  brandId: string;
  date: string; // YYYY-MM-DD
  platform: Platform;
  text: string;
  status: PostStatus;
  pillar?: string;
  hook?: string;
  visual?: string;
  visualAsset?: GeneratedAIVisual;
  hashtags?: string[];
  bestPostingTime?: string;
}

export interface CopyStrategyMetadata {
  formula: string; // e.g., "PAS (Problem, Agitate, Solution)", "BAB", "AIDA", "4 Ps"
  angle: string; // e.g., "Contrarian Positioning", "Identity & Transformation", "Direct Pain"
  journeyStage?: string; // "Awareness", "Consideration", "Decision"
  soWhatOutcome: string; // The human life transformation
  hookTechnique?: string; // "Curiosity & Blindspot", "Before/After Contrast", "Pattern Interrupt"
  ctaBreakdown?: string; // Action + what they get + low friction
}

export interface StudioVersion {
  platform: Platform;
  hook: string;
  caption: string;
  hashtags: string[];
  visual?: string;
  visualAsset?: GeneratedAIVisual;
  estimatedReadingTime?: string;
  copyStrategy?: CopyStrategyMetadata;
}

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  text: string;
}

export interface ReelScript {
  hook: string;
  visualHook?: string;
  beats: string[];
  cta: string;
}

export interface StandaloneCaption {
  platform: Platform;
  caption: string;
  hashtags?: string[];
}

export interface RepurposeResult {
  carousel: CarouselSlide[];
  reel: ReelScript;
  thread: string[];
  captions: StandaloneCaption[];
  whatsappPitch?: string;
  copyStrategy?: CopyStrategyMetadata;
}

export interface ReplyOption {
  label: string;
  text: string;
}

export interface AnalyzedReplyItem {
  original: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'critical';
  isSensitive: boolean;
  flagReason?: string | null;
  moderatorTip?: string;
  options: ReplyOption[];
}

export interface NextStepTask {
  task: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface AuditRecommendedConcept {
  platform: Platform;
  format: string;
  hook: string;
  concept: string;
  expectedResult: string;
}

export interface SearchGroundingSource {
  title: string;
  url: string;
}

export interface SearchGroundingResult {
  isSearchGrounded: boolean;
  locationQueried: string;
  locationVerified: boolean;
  disambiguationNote?: string;
  webPresenceSummary: string;
  onlineReputation?: string;
  queriesRun?: string[];
  sourcesFound?: SearchGroundingSource[];
}

export interface AuditSuggestedCalendarDay {
  day: number;
  title: string;
  date?: string;
  platform: Platform;
  pillar: string; // "Educational" | "Authority / Proof" | "Community / Connection" | "Conversion / Offer"
  hook: string;
  hookType: string; // e.g. "Contrarian / Blindspot", "Proof-First", "Pattern Interrupt", "Story-Lesson"
  framework: string; // e.g. "PAS (Problem, Agitate, Solution)", "BAB", "Story-Lesson-Action", "3-Step Teardown"
  frameworkSteps?: string[];
  caption: string;
  cta: string;
  ctaMechanism?: string; // e.g. "Comment 'AUDIT' to receive DM", "Save this post", "Tap bio link"
  visualDirection?: string;
  bestPostingTime?: string;
  auditGapAddressed?: string;
}

export interface AuditResult {
  handle: string;
  platform: string;
  healthScore: number;
  summary: string;
  groundingNote?: string;
  auditedNiche?: string;
  location?: string;
  searchGrounding?: SearchGroundingResult;
  suggestedCalendar?: AuditSuggestedCalendarDay[];
  isGroundedWithBio?: boolean;
  hasContentSamples?: boolean;
  detectedWall?: string;
  subScores: {
    profileOptimization: number;
    contentVariety: number;
    hookEffectiveness: number;
    communityEngagement: number;
    aestheticConsistency: number;
  };
  bioAudit: {
    currentVibe: string;
    recommendations: string[];
  };
  strengths: string[];
  gaps: string[];
  nextSteps: {
    immediate: NextStepTask[];
    sevenDaySprint: NextStepTask[];
    thirtyDayStrategy: NextStepTask[];
  };
  recommendedConcepts: AuditRecommendedConcept[];
}

export interface LinkInspectionResult {
  platform: string;
  handle: string;
  isLoginWalled: boolean;
  metaTitle?: string;
  metaDescription?: string;
  notice?: string;
}

export interface SocialTrend {
  id: string;
  title: string;
  type: string;
  platforms: Platform[];
  velocity: 'Exploding' | 'Peak' | 'Emerging';
  whyItWorks: string;
  structure: string;
  sampleHook: string;
  brandAdaptation: string;
  hashtags: string[];
}

export interface TrendsResponse {
  trends: SocialTrend[];
  algorithmNotes: string[];
}

export interface WorkedMetric {
  post: string;
  proof: string;
  takeaway: string;
}

export interface UnderperformedMetric {
  post: string;
  proof: string;
  diagnosis: string;
}

export interface NextExperiment {
  idea: string;
  format: string;
  platform: Platform;
  hypothesis: string;
}

export interface InsightsResult {
  summary: string;
  worked: WorkedMetric[];
  underperformed: UnderperformedMetric[];
  diagnostics: {
    topFormat?: string;
    topEngagementDriver?: string;
    retentionAlert?: string;
  };
  nextExperiments: NextExperiment[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type AlertType = 'reply' | 'audit_task' | 'calendar_draft' | 'trend';

export interface DirectorAlert {
  id: string;
  brandId?: string;
  type: AlertType;
  title: string;
  description: string;
  severity: 'urgent' | 'action_needed' | 'suggestion';
  timestamp: string;
  actionLabel?: string;
  targetTab?: string;
  data?: any;
  isRead?: boolean;
}
