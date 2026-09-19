import { AuditInput, MaltaAuditResult, DependencyNode, AuditIssue, MaltaMaintenanceLevel } from '../types';
import { generateDecayCurve } from '../data/mockData';
import { runMaltaAudit } from './maltaEngine';

export async function runLiveMaltaAudit(input: AuditInput): Promise<MaltaAuditResult> {
  const manifest = input.manifestContent || '';

  // If there are dependencies, query the live MALTA backend on port 3003
  if (manifest.trim().length > 0) {
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: manifest })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dependencies && data.dependencies.length > 0) {
          return mapBackendToAuditResult(data.dependencies);
        }
      }
    } catch (err) {
      console.warn('Live backend audit failed, falling back to local engine:', err);
    }
  }

  // Fallback to local engine
  return runMaltaAudit(input);
}

function mapBackendToAuditResult(backendDeps: any[]): MaltaAuditResult {
  const dependencies: DependencyNode[] = backendDeps.map((dep: any) => {
    const instVer = dep.currentVersion ? (dep.currentVersion.startsWith('v') ? dep.currentVersion : `v${dep.currentVersion}`) : 'v1.0.0';
    const latVer = dep.latestVersion ? (dep.latestVersion.startsWith('v') ? dep.latestVersion : `v${dep.latestVersion}`) : instVer;
    const finalScore = dep.finalScore ?? 0;
    const das = dep.dasDetails || {};
    const mrs = dep.mrsDetails || {};
    const rmvs = dep.rmvsDetails || {};

    const dasScore = dep.devActivityScore !== null ? Number((dep.devActivityScore * 100).toFixed(1)) : 0;
    const mrsScore = dep.mrsDefined && dep.maintRespScore !== null ? Number((dep.maintRespScore * 100).toFixed(1)) : 0;
    const rmvsScore = dep.metadataScore !== null ? Number((dep.metadataScore * 100).toFixed(1)) : 0;

    const isZombie = Boolean(dep.isZombie);
    const isDiscordant = Boolean(dep.isDiscordant);
    const isProof = Boolean(dep.proofOverride);

    let status: 'HEALTHY' | 'STALLED' | 'ARCHIVED' | 'GHOST' | 'UNPINNED' | 'UNKNOWN' = 'HEALTHY';
    if (isZombie) status = 'GHOST';
    else if (isDiscordant) status = 'STALLED';
    else if (rmvs.archived) status = 'ARCHIVED';
    else if (finalScore < 40) status = 'STALLED';

    const riskLevel: 'low' | 'moderate' | 'critical' | 'unknown' =
      isZombie || finalScore < 30 ? 'critical' : finalScore < 60 ? 'moderate' : 'low';

    const indicators: string[] = [];
    if (isZombie) indicators.push('Zombie Ghost', 'Inactivity > 2y');
    else if (isProof) indicators.push('Pulse Verified', 'Usage > 1M/mo');
    else if (isDiscordant) indicators.push('Discordant Ghost', 'Zero Version Lag');
    else if (finalScore >= 60) indicators.push('Active Triage', 'Healthy Cadence');

    return {
      name: dep.name,
      version: dep.currentVersion || 'unknown',
      installedVersion: instVer,
      latestVersion: latVer,
      status,
      riskLevel,
      riskAssessment: dep.riskLevel || (finalScore >= 60 ? 'Low Risk' : finalScore >= 40 ? 'Moderate Risk' : 'Critical Abandonment'),
      healthIndicators: indicators,
      type: 'runtime',
      description: dep.proofReason || (isZombie ? dep.zombieReason : `Audited dependency ${dep.name}`),
      lastCommit: das.tLastDays !== undefined ? `${das.tLastDays} days ago` : `${dep.maintenanceLagDays || 0} days ago`,
      versionLagDays: dep.timeLagDays || (dep.versionLag ? dep.versionLag * 365 : 0),
      maintenanceLagDays: dep.maintenanceLagDays || das.tLastDays || 0,
      isDiscordant,
      dasScore,
      mrsScore,
      rmvsScore,
      maltaScore: finalScore,
      dasDetails: {
        lambdaRatio: das.velocityDecay || 1.0,
        tLastDays: das.tLastDays || dep.maintenanceLagDays || 0,
        decayFactor: das.recencyTerm || 1.0
      },
      mrsDetails: {
        rDec: mrs.Rdec || 0,
        dDec: mrs.Ddec || 0,
        pStale: mrs.Pstale || 0
      },
      rmvsDetails: {
        stars: (rmvs.stars || 0) / 1000,
        forks: (rmvs.forks || 0) / 1000,
        watchers: (rmvs.watchers || 0) / 1000,
        hasLicense: true,
        aPen: rmvs.Apen || 1.0
      }
    };
  });

  const count = dependencies.length || 1;
  const avgFinalScore = Number((dependencies.reduce((a, b) => a + (b.maltaScore || 0), 0) / count).toFixed(1));
  const avgDas = Number((dependencies.reduce((a, b) => a + b.dasScore, 0) / count).toFixed(1));
  const avgMrs = Number((dependencies.reduce((a, b) => a + b.mrsScore, 0) / count).toFixed(1));
  const avgRmvs = Number((dependencies.reduce((a, b) => a + b.rmvsScore, 0) / count).toFixed(1));

  let maintenanceLevel: MaltaMaintenanceLevel = 'Sustained Maintenance';
  let levelColor = '#10b981';
  let levelEmoji = '🟢';
  let levelBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';

  if (avgFinalScore >= 80) {
    maintenanceLevel = 'Sustained Maintenance';
    levelColor = '#10b981';
    levelEmoji = '🟢';
    levelBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (avgFinalScore >= 60) {
    maintenanceLevel = 'Stable Maintenance';
    levelColor = '#059669';
    levelEmoji = '🟢';
    levelBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (avgFinalScore >= 40) {
    maintenanceLevel = 'Declining Maintenance';
    levelColor = '#eab308';
    levelEmoji = '🟡';
    levelBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (avgFinalScore >= 20) {
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

  const discordantPackages = dependencies.filter(d => d.isDiscordant).map(d => ({
    name: d.name,
    version: d.version,
    versionLag: 'LOW' as const,
    maintenanceLagDays: d.maintenanceLagDays,
    explanation: `Version is on latest release (${d.version}), but repository has ${d.maintenanceLagDays} days of maintenance lag.`,
    isGhost: true
  }));

  const issues: AuditIssue[] = [];
  dependencies.forEach(d => {
    if (d.status === 'GHOST') {
      issues.push({
        id: `MALTA-GHOST-${d.name}`,
        pillar: 'DISCORDANT',
        pillarLabel: 'Special Sauce: Ghost Detection',
        severity: 'critical',
        title: `Zombie / Ghost Package: ${d.name}`,
        description: `No commits for ${d.maintenanceLagDays} days despite being on latest release.`,
        impact: 'Critical unmaintained upstream risk. Security CVEs and breaking changes will never be resolved.',
        remediationCode: `pip uninstall ${d.name}`
      });
    }
  });

  const maxLag = Math.max(...dependencies.map(d => d.maintenanceLagDays), 18);
  const decayCurveData = generateDecayCurve(Math.min(maxLag, 360));

  const pillarComparisonData = [
    {
      pillar: 'DAS',
      fullName: 'Development Activity',
      weightPercent: 55,
      rawScore: avgDas,
      weightedContribution: Number((0.55 * avgDas).toFixed(1)),
      benchmark: 85
    },
    {
      pillar: 'MRS',
      fullName: 'Maintainer Responsiveness',
      weightPercent: 35,
      rawScore: avgMrs,
      weightedContribution: Number((0.35 * avgMrs).toFixed(1)),
      benchmark: 80
    },
    {
      pillar: 'RMVS',
      fullName: 'Metadata Viability',
      weightPercent: 10,
      rawScore: avgRmvs,
      weightedContribution: Number((0.10 * avgRmvs).toFixed(1)),
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
    finalScore: avgFinalScore,
    maintenanceLevel,
    levelColor,
    levelEmoji,
    levelBadgeClass,
    pillars: {
      das: {
        score: avgDas,
        normalized: avgDas / 100,
        lambdaRatio: 1.0,
        tLastDays: maxLag,
        decayFactor: Math.exp(-maxLag / 180),
        dropPercentage: Number(((1 - Math.exp(-maxLag / 180)) * 100).toFixed(1)),
        weight: 0.55
      },
      mrs: {
        score: avgMrs,
        normalized: avgMrs / 100,
        rDec: 0.9,
        dDec: 0.1,
        pStale: 0.1,
        collapsed: false,
        weight: 0.35
      },
      rmvs: {
        score: avgRmvs,
        normalized: avgRmvs / 100,
        stars: 0.9,
        forks: 0.9,
        watchers: 0.9,
        hasLicense: true,
        aPen: 1.0,
        weight: 0.10
      }
    },
    discordantDetection: {
      totalAudited: dependencies.length,
      discordantCount: discordantPackages.length,
      healthyCount: dependencies.length - discordantPackages.length,
      discordantPackages
    },
    scanDuration: 'Live Engine Call',
    timestamp: new Date().toISOString(),
    hash: `live:${Date.now().toString(16)}`,
    dependencies,
    issues,
    decayCurveData,
    pillarComparisonData,
    discordantMatrixData
  };
}
