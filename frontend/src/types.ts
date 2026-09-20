export type SlideId = 'hero' | 'dashboard' | 'report';

export type InputMode = 'manifest' | 'github' | 'latex' | 'code';

export interface AuditInput {
  mode: InputMode;
  repoUrl: string;
  branch: string;
  manifestContent: string;
  manifestFileName: string;
  codeContent: string;
  presetId?: string;
}

export interface DependencyNode {
  name: string;
  version: string;
  installedVersion?: string;
  latestVersion?: string;
  status: 'HEALTHY' | 'STALLED' | 'ARCHIVED' | 'GHOST' | 'UNPINNED' | 'UNKNOWN';
  riskLevel: 'low' | 'moderate' | 'critical' | 'unknown';
  riskAssessment?: string;
  healthIndicators?: string[];
  type: 'runtime' | 'transitive' | 'peer';
  description: string;
  lastCommit?: string;
  upstreamPypi?: string;
  repositoryUrl?: string;
  hasError?: boolean;
  mrsUndefined?: boolean;
  // Discordant Ghost parameters
  versionLagDays: number;
  maintenanceLagDays: number;
  isDiscordant: boolean; // LOW version lag + HIGH maintenance lag (>365d)
  dasScore: number;
  mrsScore: number;
  rmvsScore: number;
  maltaScore?: number;
  // Individual formula parameters
  dasDetails?: {
    lambdaRatio: number;
    tLastDays: number;
    decayFactor: number;
  };
  mrsDetails?: {
    rDec: number;
    dDec: number;
    pStale: number;
  };
  rmvsDetails?: {
    stars: number;
    forks: number;
    watchers: number;
    hasLicense: boolean;
    aPen: number;
  };
}

export interface MaltaPillarScores {
  // 1. DAS — Development Activity (55%)
  das: {
    score: number; // 0-100
    normalized: number; // 0-1
    lambdaRatio: number; // min(1, λe / λb)
    tLastDays: number; // Days since last commit
    decayFactor: number; // e^(-t_last/180)
    dropPercentage: number;
    weight: 0.55;
  };

  // 2. MRS — Maintainer Responsiveness (35%)
  mrs: {
    score: number; // 0-100
    normalized: number; // 0-1
    rDec: number; // Maintainers response rate
    dDec: number; // Documentation staleness
    pStale: number; // Fraction of stale/hanging PRs & issues
    collapsed: boolean;
    weight: 0.35;
  };

  // 3. RMVS — Metadata Viability (10%)
  rmvs: {
    score: number; // 0-100
    normalized: number; // 0-1
    stars: number;
    forks: number;
    watchers: number;
    hasLicense: boolean;
    aPen: number; // Activity penalty (0 if archived/dead, 1 if alive)
    weight: 0.10;
  };
}

export type MaltaMaintenanceLevel = 
  | 'Sustained Maintenance'
  | 'Stable Maintenance'
  | 'Declining Maintenance'
  | 'Probable Abandonment'
  | 'Effective Abandonment';

export interface MaltaAuditResult {
  finalScore: number; // 0-100: 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS)
  maintenanceLevel: MaltaMaintenanceLevel;
  levelColor: string;
  levelEmoji: string;
  levelBadgeClass: string;
  pillars: MaltaPillarScores;
  
  // Discordant Detection (Ghost Repos)
  discordantDetection: {
    totalAudited: number;
    discordantCount: number;
    healthyCount: number;
    discordantPackages: {
      name: string;
      version: string;
      versionLag: 'LOW' | 'MODERATE' | 'HIGH';
      maintenanceLagDays: number;
      explanation: string;
      isGhost: boolean;
    }[];
  };

  scanDuration: string;
  timestamp: string;
  hash: string;
  dependencies: DependencyNode[];
  issues: AuditIssue[];

  // Charts data
  decayCurveData: {
    day: number;
    penalty: number;
    currentPoint?: boolean;
  }[];
  pillarComparisonData: {
    pillar: string;
    fullName: string;
    weightPercent: number;
    rawScore: number;
    weightedContribution: number;
    benchmark: number;
  }[];
  discordantMatrixData: {
    name: string;
    versionLagScore: number; // 0-100 (100 = up to date)
    maintenanceLagDays: number;
    isGhost: boolean;
    status: string;
  }[];
}

export interface AuditIssue {
  id: string;
  pillar: 'DAS' | 'MRS' | 'RMVS' | 'DISCORDANT';
  pillarLabel: string;
  severity: 'critical' | 'high' | 'moderate' | 'verified';
  title: string;
  description: string;
  impact: string;
  formulaNote?: string;
  remediationCode?: string;
}

export interface PresetRepo {
  id: string;
  name: string;
  label: string;
  branch: string;
  description: string;
  tags: string[];
  sampleManifest: string;
  sampleCode: string;
}
