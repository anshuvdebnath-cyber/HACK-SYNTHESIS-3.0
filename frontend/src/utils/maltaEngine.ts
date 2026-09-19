import { AuditInput, MaltaAuditResult, DependencyNode, AuditIssue, MaltaMaintenanceLevel } from '../types';
import { PRESETS, generateDecayCurve } from '../data/mockData';

export function runMaltaAudit(input: AuditInput): MaltaAuditResult {
  const isCustomCode = input.mode === 'code' && input.codeContent.trim().length > 0;
  const isCustomManifest = input.mode === 'manifest' && input.manifestContent.trim().length > 0;
  const combinedText = `${input.repoUrl} ${input.manifestContent} ${input.codeContent}`.toLowerCase();

  const matchedPreset = PRESETS.find(p => input.repoUrl.toLowerCase().includes(p.id.toLowerCase()));

  // 1. DAS — Development Activity (55%)
  // min(1, λe/λb) × e^(−t_last/180)
  let lambdaRatio = 0.95; // Recent commit/release rate vs historical rate
  let tLastDays = 18; // Inactivity days
  let dasDeductions = 0;

  // 2. MRS — Maintainer Responsiveness (35%)
  // R_dec × (1 − D_dec) × (1 − P_stale)
  let rDec = 0.92; // Maintainer response rate to issues/PRs
  let dDec = 0.08; // Documentation staleness
  let pStale = 0.05; // Fraction of issues/PRs hanging

  // 3. RMVS — Metadata Viability (10%)
  // A_pen × (0.25×Stars + 0.25×Forks + 0.25×Watchers + 0.25×License)
  let starsNorm = 0.92;
  let forksNorm = 0.90;
  let watchersNorm = 0.88;
  let hasLicense = true;
  let aPen = 1.0; // 0 if archived/dead

  const dependencies: DependencyNode[] = [];
  const issues: AuditIssue[] = [];

  // Parse Manifest
  const manifestLines = (isCustomManifest ? input.manifestContent : (matchedPreset?.sampleManifest || '')).split('\n');

  manifestLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    if (trimmed.includes('numpy')) {
      const parts = trimmed.split('==');
      const instVer = parts[1]?.trim() || '1.19.5';
      const isOutdated = instVer.startsWith('1.');
      dependencies.push({
        name: 'numpy',
        version: instVer,
        installedVersion: `v${instVer}`,
        latestVersion: 'v2.5.3',
        status: isOutdated ? 'STALLED' : 'HEALTHY',
        riskLevel: isOutdated ? 'moderate' : 'low',
        riskAssessment: isOutdated ? 'Moderate (Version Lag: Major v1.x → v2.5.3)' : 'Low (Up to date)',
        healthIndicators: isOutdated ? ['Major Version Lag', `Pinned (${instVer})`, 'Missing Modern SIMD'] : ['Zero Version Lag', 'Active Triage'],
        type: 'runtime',
        description: 'Fundamental package for array computing with C/C++ acceleration.',
        lastCommit: '28 days ago',
        versionLagDays: isOutdated ? 1240 : 0,
        maintenanceLagDays: 28,
        isDiscordant: false,
        dasScore: 68.2,
        mrsScore: 78.4,
        rmvsScore: 96.0,
        maltaScore: 74.5,
        dasDetails: { lambdaRatio: 0.85, tLastDays: 28, decayFactor: 0.856 },
        mrsDetails: { rDec: 0.88, dDec: 0.04, pStale: 0.08 },
        rmvsDetails: { stars: 0.98, forks: 0.96, watchers: 0.94, hasLicense: true, aPen: 1.0 }
      });
    } else if (trimmed.includes('seaborn')) {
      const parts = trimmed.split('==');
      const instVer = parts[1]?.trim() || '0.13.2';
      dependencies.push({
        name: 'seaborn',
        version: instVer,
        installedVersion: `v${instVer}`,
        latestVersion: 'v0.13.2',
        status: 'HEALTHY',
        riskLevel: 'low',
        riskAssessment: 'Low (Active Maintenance & Zero Lag)',
        healthIndicators: ['Zero Version Lag', 'Active Triage', 'BSD-3 License'],
        type: 'runtime',
        description: 'Statistical data visualization based on matplotlib.',
        lastCommit: '12 days ago',
        versionLagDays: 0,
        maintenanceLagDays: 12,
        isDiscordant: false,
        dasScore: 89.0,
        mrsScore: 84.5,
        rmvsScore: 92.0,
        maltaScore: 87.7,
        dasDetails: { lambdaRatio: 0.95, tLastDays: 12, decayFactor: 0.935 },
        mrsDetails: { rDec: 0.92, dDec: 0.03, pStale: 0.05 },
        rmvsDetails: { stars: 0.94, forks: 0.90, watchers: 0.88, hasLicense: true, aPen: 1.0 }
      });
    } else if (trimmed.includes('pymorphy2')) {
      const parts = trimmed.split('==');
      const instVer = parts[1]?.trim() || '0.9.1';
      dependencies.push({
        name: 'pymorphy2',
        version: instVer,
        installedVersion: `v${instVer}`,
        latestVersion: 'v0.9.1',
        status: 'GHOST',
        riskLevel: 'critical',
        riskAssessment: 'Critical (Discordant Ghost: Inactivity > 2,000d)',
        healthIndicators: ['Discordant Ghost', 'Zero Commits > 2000d', 'Maintainers Abandoned'],
        type: 'runtime',
        description: 'Morphological analyzer for Russian language. Stalled since 2018; maintainers vanished.',
        lastCommit: '6 years ago',
        versionLagDays: 0,
        maintenanceLagDays: 2150,
        isDiscordant: true,
        dasScore: 6.4,
        mrsScore: 0.0,
        rmvsScore: 42.0,
        maltaScore: 7.7,
        dasDetails: { lambdaRatio: 0.05, tLastDays: 2150, decayFactor: 0.0001 },
        mrsDetails: { rDec: 0.0, dDec: 0.45, pStale: 0.85 },
        rmvsDetails: { stars: 0.45, forks: 0.40, watchers: 0.35, hasLicense: true, aPen: 0.5 }
      });
      issues.push({
        id: 'MALTA-GHOST-02',
        pillar: 'DISCORDANT',
        pillarLabel: 'Special Sauce: Discordant Detection',
        severity: 'critical',
        title: 'Discordant Ghost Package Detected: pymorphy2',
        description: 'Version lag is 0 (installed v0.9.1 is latest release), but Maintenance lag is >2,150 days. The repository has been dead for 6 years.',
        impact: 'C-extension compilation breakage on Python >=3.11; dormant CVEs.',
        formulaNote: 'Version lag = LOW ∧ Maintenance lag > 365d → Discordant Ghost',
        remediationCode: 'pip install pymorphy3 # actively maintained modern fork'
      });
    } else if (trimmed.includes('pycrypto')) {
      aPen = 0.4; // Activity penalty for dead/archived sub-dependency
      tLastDays = Math.max(tLastDays, 120);
      rDec *= 0.75;
      
      dependencies.push({
        name: 'pycrypto',
        version: '2.6.1',
        status: 'GHOST',
        riskLevel: 'critical',
        type: 'transitive',
        description: 'Discordant Ghost: On latest version (2.6.1) but maintenance lag > 4,000 days.',
        lastCommit: '11 years ago',
        upstreamPypi: 'Deprecation flag set',
        versionLagDays: 0,
        maintenanceLagDays: 4120,
        isDiscordant: true,
        dasScore: 0,
        mrsScore: 0,
        rmvsScore: 20
      });

      issues.push({
        id: 'MALTA-GHOST-01',
        pillar: 'DISCORDANT',
        pillarLabel: 'Special Sauce: Discordant Detection',
        severity: 'critical',
        title: 'Discordant Ghost Package Detected: pycrypto',
        description: 'Version lag is LOW (installed v2.6.1 is latest PyPI release), but Maintenance lag is HIGH (4,120+ days without commits). Version says "alive", but repo is dead!',
        impact: 'Build failure on modern OS compilers; 8 unresolved CVE vulnerabilities.',
        formulaNote: 'Version lag = LOW ∧ Maintenance lag > 365d → Discordant Ghost',
        remediationCode: 'pip uninstall pycrypto && pip install cryptography'
      });
    } else if (trimmed.includes('scikit-survival')) {
      tLastDays = Math.max(tLastDays, 85);
      pStale += 0.15;

      dependencies.push({
        name: 'scikit-survival',
        version: '0.17.2',
        status: 'STALLED',
        riskLevel: 'moderate',
        type: 'transitive',
        description: 'Maintenance lag exceeds 365 days. Missing wheels for modern Python.',
        lastCommit: '14 months ago',
        versionLagDays: 30,
        maintenanceLagDays: 440,
        isDiscordant: true,
        dasScore: 24,
        mrsScore: 20,
        rmvsScore: 60
      });

      issues.push({
        id: 'MALTA-DAS-02',
        pillar: 'DAS',
        pillarLabel: 'Development Activity (55%)',
        severity: 'high',
        title: 'Exponential Inactivity Decay in scikit-survival',
        description: 'Days of inactivity t_last = 440 exceeds 180-day half-life threshold.',
        impact: 'e^(-t_last/180) penalty drastically reduces Development Activity Score.',
        formulaNote: 'DAS = min(1, λe/λb) × e^(-t_last/180)',
        remediationCode: 'Replace with lifelines or active maintainer wheel'
      });
    } else if (trimmed.includes('>=') || (!trimmed.includes('==') && !trimmed.includes('<=') && !trimmed.includes('~='))) {
      const pkgName = trimmed.split(/[><=~]/)[0].trim();
      pStale += 0.02;
      dependencies.push({
        name: pkgName || 'unpinned-pkg',
        version: trimmed,
        installedVersion: trimmed.startsWith('v') ? trimmed : `v${trimmed}`,
        latestVersion: trimmed.startsWith('v') ? trimmed : `v${trimmed}`,
        status: 'UNPINNED',
        riskLevel: 'moderate',
        riskAssessment: 'Moderate (Floating Version Range)',
        healthIndicators: ['Unpinned Range', 'Precision Drift Risk'],
        type: 'runtime',
        description: 'Unpinned floating dependency declaration.',
        lastCommit: 'Current',
        versionLagDays: 0,
        maintenanceLagDays: 7,
        isDiscordant: false,
        dasScore: 90,
        mrsScore: 88,
        rmvsScore: 92,
        dasDetails: { lambdaRatio: 0.95, tLastDays: 7, decayFactor: 0.96 },
        mrsDetails: { rDec: 0.92, dDec: 0.04, pStale: 0.05 },
        rmvsDetails: { stars: 0.92, forks: 0.88, watchers: 0.85, hasLicense: true, aPen: 1.0 }
      });
    } else {
      const parts = trimmed.split('==');
      const pkgName = parts[0]?.trim() || trimmed;
      const ver = parts[1]?.trim() || '1.0.0';
      dependencies.push({
        name: pkgName,
        version: ver,
        installedVersion: ver.startsWith('v') ? ver : `v${ver}`,
        latestVersion: ver.startsWith('v') ? ver : `v${ver}`,
        status: 'HEALTHY',
        riskLevel: 'low',
        riskAssessment: 'Low (Active Pinned Package)',
        healthIndicators: ['Pinned Version', 'Active Maintenance', 'OSI License'],
        type: 'runtime',
        description: 'Active pinned dependency with low maintenance lag.',
        lastCommit: 'Recent',
        versionLagDays: 7,
        maintenanceLagDays: 3,
        isDiscordant: false,
        dasScore: 96,
        mrsScore: 94,
        rmvsScore: 98,
        dasDetails: { lambdaRatio: 1.0, tLastDays: 3, decayFactor: 0.98 },
        mrsDetails: { rDec: 0.95, dDec: 0.02, pStale: 0.03 },
        rmvsDetails: { stars: 0.96, forks: 0.92, watchers: 0.90, hasLicense: true, aPen: 1.0 }
      });
    }
  });

  if (dependencies.length === 0) {
    dependencies.push(
      { name: 'numpy', version: '1.19.5', installedVersion: 'v1.19.5', latestVersion: 'v2.5.3', status: 'STALLED', riskLevel: 'moderate', riskAssessment: 'Moderate (Version Lag: v1.19.5 → v2.5.3)', healthIndicators: ['Major Version Lag', 'Pinned'], type: 'runtime', description: 'Array computing.', versionLagDays: 1240, maintenanceLagDays: 28, isDiscordant: false, dasScore: 68.2, mrsScore: 78.4, rmvsScore: 96.0 },
      { name: 'seaborn', version: '0.13.2', installedVersion: 'v0.13.2', latestVersion: 'v0.13.2', status: 'HEALTHY', riskLevel: 'low', riskAssessment: 'Low (Active Maintenance)', healthIndicators: ['Zero Version Lag', 'Active Triage'], type: 'runtime', description: 'Statistical visualization.', versionLagDays: 0, maintenanceLagDays: 12, isDiscordant: false, dasScore: 89.0, mrsScore: 84.5, rmvsScore: 92.0 },
      { name: 'pymorphy2', version: '0.9.1', installedVersion: 'v0.9.1', latestVersion: 'v0.9.1', status: 'GHOST', riskLevel: 'critical', riskAssessment: 'Critical (Discordant Ghost: Inactivity > 2,000d)', healthIndicators: ['Discordant Ghost', 'Zero Commits'], type: 'runtime', description: 'Morphology engine.', versionLagDays: 0, maintenanceLagDays: 2150, isDiscordant: true, dasScore: 6.4, mrsScore: 0.0, rmvsScore: 42.0 }
    );
  }

  // Calculate individual MALTA Score for each dependency: 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS) / 100
  dependencies.forEach(dep => {
    if (dep.installedVersion === undefined) {
      dep.installedVersion = dep.version.startsWith('v') ? dep.version : `v${dep.version}`;
    }
    if (dep.latestVersion === undefined) {
      dep.latestVersion = dep.installedVersion;
    }
    if (dep.riskAssessment === undefined) {
      dep.riskAssessment = dep.riskLevel === 'critical' ? 'Critical (Ghost / Abandoned)' : dep.riskLevel === 'moderate' ? 'Moderate (Lag Detected)' : 'Low (Maintained)';
    }
    if (dep.maltaScore === undefined) {
      dep.maltaScore = Number(((0.55 * dep.dasScore) + (0.35 * (dep.mrsScore ?? 0)) + (0.10 * dep.rmvsScore)).toFixed(1));
    }
  });

  // Adjust for presets
  if (matchedPreset?.id === 'deepmind/alphafold') {
    lambdaRatio = 1.0;
    tLastDays = 8;
    rDec = 0.98;
    dDec = 0.02;
    pStale = 0.02;
    starsNorm = 0.99;
    forksNorm = 0.98;
    watchersNorm = 0.96;
    aPen = 1.0;
  } else if (matchedPreset?.id === 'facebookresearch/fairseq') {
    lambdaRatio = 0.65;
    tLastDays = 140;
    rDec = 0.60;
    dDec = 0.25;
    pStale = 0.38;
    aPen = 0.60;
  } else if (matchedPreset?.id === 'karpathy/nanoGPT') {
    lambdaRatio = 0.90;
    tLastDays = 24;
    rDec = 0.88;
    dDec = 0.04;
    pStale = 0.08;
    starsNorm = 0.98;
    forksNorm = 0.95;
    watchersNorm = 0.94;
    aPen = 1.0;
  }

  // 1. Calculate DAS (55%)
  // min(1, λe/λb) × e^(−t_last/180)
  const decayFactor = Math.exp(-tLastDays / 180);
  const dasNormalized = Math.min(1.0, lambdaRatio) * decayFactor;
  const dasScore = Number((dasNormalized * 100).toFixed(1));
  const dropPercentage = Number(((1 - decayFactor) * 100).toFixed(1));

  // 2. Calculate MRS (35%)
  // R_dec × (1 − D_dec) × (1 − P_stale)
  const mrsNormalized = Math.max(0, rDec * (1 - dDec) * (1 - pStale));
  const mrsScore = Number((mrsNormalized * 100).toFixed(1));
  const collapsed = (rDec < 0.3 || (1 - dDec) < 0.3 || (1 - pStale) < 0.3);

  // 3. Calculate RMVS (10%)
  // A_pen × (0.25×Stars + 0.25×Forks + 0.25×Watchers + 0.25×License)
  const licenseVal = hasLicense ? 1.0 : 0.0;
  const rmvsInner = (0.25 * starsNorm) + (0.25 * forksNorm) + (0.25 * watchersNorm) + (0.25 * licenseVal);
  const rmvsNormalized = aPen * rmvsInner;
  const rmvsScore = Number((rmvsNormalized * 100).toFixed(1));

  // MALTA Formula: Final Score = 100 × (0.55×DAS + 0.35×MRS + 0.10×RMVS)
  const rawFinalScore = 100 * ((0.55 * dasNormalized) + (0.35 * mrsNormalized) + (0.10 * rmvsNormalized));
  const finalScore = Number(Math.max(0, Math.min(100, rawFinalScore)).toFixed(1));

  // 5-Level Scale
  // 80–100: Sustained Maintenance 🟢
  // 60–79: Stable Maintenance 🟢
  // 40–59: Declining Maintenance 🟡
  // 20–39: Probable Abandonment 🟠
  // 0–19: Effective Abandonment 🔴
  let maintenanceLevel: MaltaMaintenanceLevel = 'Sustained Maintenance';
  let levelColor = '#10b981';
  let levelEmoji = '🟢';
  let levelBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';

  if (finalScore >= 80) {
    maintenanceLevel = 'Sustained Maintenance';
    levelColor = '#10b981';
    levelEmoji = '🟢';
    levelBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (finalScore >= 60) {
    maintenanceLevel = 'Stable Maintenance';
    levelColor = '#059669';
    levelEmoji = '🟢';
    levelBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (finalScore >= 40) {
    maintenanceLevel = 'Declining Maintenance';
    levelColor = '#eab308';
    levelEmoji = '🟡';
    levelBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (finalScore >= 20) {
    maintenanceLevel = 'Probable Abandonment';
    levelColor = '#f97316';
    levelEmoji = '🟠';
    levelBadgeClass = 'bg-orange-50 text-orange-800 border-orange-300';
  } else {
    maintenanceLevel = 'Effective Abandonment';
    levelColor = '#ef4444';
    levelEmoji = '🔴';
    levelBadgeClass = 'bg-red-50 text-red-800 border-red-300';
  }

  // Discordant packages
  const discordantPackages = dependencies.filter(d => d.isDiscordant).map(d => ({
    name: d.name,
    version: d.version,
    versionLag: 'LOW' as const,
    maintenanceLagDays: d.maintenanceLagDays,
    explanation: `Version is on latest release (${d.version}), but repository has ${d.maintenanceLagDays} days of maintenance lag. Version says "alive", but repo is dead!`,
    isGhost: true
  }));

  const decayCurveData = generateDecayCurve(tLastDays);

  const pillarComparisonData = [
    {
      pillar: 'DAS',
      fullName: 'Development Activity',
      weightPercent: 55,
      rawScore: dasScore,
      weightedContribution: Number((0.55 * dasScore).toFixed(1)),
      benchmark: 85
    },
    {
      pillar: 'MRS',
      fullName: 'Maintainer Responsiveness',
      weightPercent: 35,
      rawScore: mrsScore,
      weightedContribution: Number((0.35 * mrsScore).toFixed(1)),
      benchmark: 80
    },
    {
      pillar: 'RMVS',
      fullName: 'Metadata Viability',
      weightPercent: 10,
      rawScore: rmvsScore,
      weightedContribution: Number((0.10 * rmvsScore).toFixed(1)),
      benchmark: 90
    }
  ];

  const discordantMatrixData = dependencies.map(d => ({
    name: d.name,
    versionLagScore: Math.max(10, 100 - (d.versionLagDays * 2)),
    maintenanceLagDays: d.maintenanceLagDays,
    isGhost: d.isDiscordant,
    status: d.isDiscordant ? 'Discordant Ghost' : d.status
  }));

  return {
    finalScore,
    maintenanceLevel,
    levelColor,
    levelEmoji,
    levelBadgeClass,
    pillars: {
      das: {
        score: dasScore,
        normalized: dasNormalized,
        lambdaRatio,
        tLastDays,
        decayFactor,
        dropPercentage,
        weight: 0.55
      },
      mrs: {
        score: mrsScore,
        normalized: mrsNormalized,
        rDec,
        dDec,
        pStale,
        collapsed,
        weight: 0.35
      },
      rmvs: {
        score: rmvsScore,
        normalized: rmvsNormalized,
        stars: starsNorm,
        forks: forksNorm,
        watchers: watchersNorm,
        hasLicense,
        aPen,
        weight: 0.10
      }
    },
    discordantDetection: {
      totalAudited: dependencies.length,
      discordantCount: discordantPackages.length,
      healthyCount: dependencies.length - discordantPackages.length,
      discordantPackages
    },
    scanDuration: `${(2.8 + Math.random() * 0.9).toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    hash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    dependencies,
    issues,
    decayCurveData,
    pillarComparisonData,
    discordantMatrixData
  };
}
