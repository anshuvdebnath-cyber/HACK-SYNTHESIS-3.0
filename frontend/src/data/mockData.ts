import { PresetRepo, MaltaAuditResult } from '../types';

export const PRESETS: PresetRepo[] = [
  {
    id: '3-dependencies-benchmark',
    name: 'numpy, seaborn, pymorphy2 (3 Packages Matrix)',
    label: '3 Packages Matrix (numpy, seaborn, pymorphy2)',
    branch: 'main',
    description: 'Audited 3-package benchmark matrix containing numpy v1.19.5, seaborn v0.13.2, and pymorphy2 v0.9.1.',
    tags: ['3-Package Matrix', 'Benchmark', 'Ghost Detection', 'PyPI'],
    sampleManifest: `numpy==1.19.5
seaborn==0.13.2
pymorphy2==0.9.1
`,
    sampleCode: `import numpy as np
import seaborn as sns
import pymorphy2

# 3-Package Pipeline
arr = np.array([1, 2, 3])
morph = pymorphy2.MorphAnalyzer()
`
  },
  {
    id: 'stanford-crfm/helm',
    name: 'stanford-crfm/helm',
    label: 'stanford-crfm/helm',
    branch: 'main',
    description: 'Holistic Evaluation of Language Models by Stanford Center for Research on Foundation Models.',
    tags: ['PyTorch', 'Transformers', 'Evaluation', 'Stanford CRFM'],
    sampleManifest: `torch>=2.1.0,<=2.4.0
transformers==4.38.2
tqdm==4.66.2
pydantic==2.6.4
numpy==1.26.4
scipy==1.12.0
scikit-learn==1.4.1
datasets==2.18.0
accelerate==0.28.0
sentencepiece==0.2.0
# Notice: unpinned transitive telemetry wheels
`,
    sampleCode: `import os
import torch
import numpy as np
from transformers import AutoModelForCausalLM, AutoTokenizer

# MALTA Seed Enforcement
SEED = 42
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)
np.random.seed(SEED)
torch.backends.cudnn.deterministic = True

def evaluate_model(model_name: str, prompt: str):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=50)
    return tokenizer.decode(outputs[0])
`
  },
  {
    id: 'facebookresearch/fairseq',
    name: 'facebookresearch/fairseq',
    label: 'facebookresearch/fairseq',
    branch: 'main',
    description: 'Sequence-to-Sequence translation toolkit. Contains discordant ghost dependencies.',
    tags: ['FAIR', 'Ghost Repos', 'Legacy PyTorch', 'Discordant'],
    sampleManifest: `torch>=1.13.0
cffi==1.15.1
cython==0.29.36
regex==2023.8.8
sacrebleu>=2.0.0
# MALTA GHOST WARNING: pycrypto is on latest version (2.6.1) but maintenance lag > 4000 days!
pycrypto==2.6.1
scikit-survival==0.17.2
numpy<1.24.0
`,
    sampleCode: `import torch
import torch.nn as nn

def initialize_weights(module):
    if isinstance(module, (nn.Linear, nn.Embedding)):
        # Notice: unseeded gaussian sampling causes replication divergence
        module.weight.data.normal_(mean=0.0, std=0.02)
`
  },
  {
    id: 'deepmind/alphafold',
    name: 'deepmind/alphafold',
    label: 'deepmind/alphafold',
    branch: 'main',
    description: 'DeepMind AlphaFold protein structure prediction system with high determinism.',
    tags: ['DeepMind', 'JAX', 'Sustained Maintenance', 'Containerized'],
    sampleManifest: `absl-py==1.4.0
biopython==1.81
dm-haiku==0.0.10
dm-tree==0.1.8
immutabledict==3.0.0
jax==0.4.13
jaxlib==0.4.13+cuda11.cudnn86
ml-collections==0.1.1
numpy==1.24.3
scipy==1.10.1
# Dockerfile: nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
`,
    sampleCode: `import jax
import jax.numpy as jnp
from alphafold.model import config
from alphafold.model import model

# Fully deterministic PRNG key tree
master_key = jax.random.PRNGKey(1337)
key_1, key_2 = jax.random.split(master_key)
`
  },
  {
    id: 'karpathy/nanoGPT',
    name: 'karpathy/nanoGPT',
    label: 'karpathy/nanoGPT',
    branch: 'master',
    description: 'The simplest, fastest repository for training/finetuning medium-sized GPTs.',
    tags: ['nanoGPT', 'Karpathy', 'Zero-Drift', 'PyTorch'],
    sampleManifest: `torch>=2.0.0
numpy
transformers
datasets
tiktoken
wandb
tqdm
`,
    sampleCode: `import torch
import numpy as np

torch.manual_seed(1337)
torch.cuda.manual_seed(1337)
np.random.seed(1337)
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True
`
  }
];

// Exponential decay data generator: e^(-t / 180)
export function generateDecayCurve(currentTLast = 18) {
  const points = [];
  for (let day = 0; day <= 365; day += 15) {
    const penalty = Number(Math.exp(-day / 180).toFixed(4));
    points.push({
      day,
      penalty,
      currentPoint: Math.abs(day - currentTLast) < 8
    });
  }
  return points;
}

export const INITIAL_AUDIT_RESULT: MaltaAuditResult = {
  // 100 × (0.55×0.92 + 0.35×0.86 + 0.10×0.95) = 100 × (0.506 + 0.301 + 0.095) = 90.2
  finalScore: 90.2,
  maintenanceLevel: 'Sustained Maintenance',
  levelColor: '#10b981', // emerald-500
  levelEmoji: '🟢',
  levelBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  pillars: {
    das: {
      score: 92.0,
      normalized: 0.92,
      lambdaRatio: 0.98, // min(1, λe/λb)
      tLastDays: 16, // Inactive for 16 days
      decayFactor: Number(Math.exp(-16 / 180).toFixed(4)), // 0.915
      dropPercentage: Number(((1 - Math.exp(-16 / 180)) * 100).toFixed(1)), // ~8.5%
      weight: 0.55
    },
    mrs: {
      score: 86.0,
      normalized: 0.86,
      rDec: 0.94, // Maintainers active on PRs
      dDec: 0.05, // Documentation fresh
      pStale: 0.04, // Very few hanging PRs (4%)
      collapsed: false,
      weight: 0.35
    },
    rmvs: {
      score: 95.0,
      normalized: 0.95,
      stars: 0.96,
      forks: 0.94,
      watchers: 0.92,
      hasLicense: true,
      aPen: 1.0, // Active repository
      weight: 0.10
    }
  },
  discordantDetection: {
    totalAudited: 8,
    discordantCount: 1,
    healthyCount: 7,
    discordantPackages: [
      {
        name: 'pycrypto',
        version: '2.6.1 (Latest)',
        versionLag: 'LOW',
        maintenanceLagDays: 4120,
        explanation: 'Version is at latest PyPI release (v2.6.1), but zero maintainer commits for 4,120+ days. Version says "alive", but repo is "dead"!',
        isGhost: true
      },
      {
        name: 'scikit-survival',
        version: '0.17.2',
        versionLag: 'MODERATE',
        maintenanceLagDays: 440,
        explanation: 'Maintenance lag exceeds 365 days threshold. Upstream repo has not merged release wheels for Python 3.12.',
        isGhost: true
      }
    ]
  },
  scanDuration: '3.42s',
  timestamp: new Date().toISOString(),
  hash: 'sha256:8f4c1e92d40b7190a1e35fc88b209d18',
  dependencies: [
    {
      name: 'numpy',
      version: '1.19.5',
      installedVersion: 'v1.19.5',
      latestVersion: 'v2.5.3',
      status: 'STALLED',
      riskLevel: 'moderate',
      riskAssessment: 'Moderate (Version Lag: v1.19.5 → v2.5.3)',
      healthIndicators: ['Major Version Lag', 'Pinned (1.19.5)', 'Missing Modern SIMD'],
      type: 'runtime',
      description: 'Numerical processing library. Severe version lag behind latest 2.5.3 release.',
      lastCommit: '28 days ago',
      versionLagDays: 1240,
      maintenanceLagDays: 28,
      isDiscordant: false,
      dasScore: 68.2,
      mrsScore: 78.4,
      rmvsScore: 96.0,
      maltaScore: 74.5,
      dasDetails: { lambdaRatio: 0.85, tLastDays: 28, decayFactor: 0.856 },
      mrsDetails: { rDec: 0.88, dDec: 0.04, pStale: 0.08 },
      rmvsDetails: { stars: 0.98, forks: 0.96, watchers: 0.94, hasLicense: true, aPen: 1.0 }
    },
    {
      name: 'seaborn',
      version: '0.13.2',
      installedVersion: 'v0.13.2',
      latestVersion: 'v0.13.2',
      status: 'HEALTHY',
      riskLevel: 'low',
      riskAssessment: 'Low (Active Maintenance & Zero Lag)',
      healthIndicators: ['Zero Version Lag', 'Active Triage', 'BSD-3 License'],
      type: 'runtime',
      description: 'Statistical data visualization. Pinned to current latest release with active maintainers.',
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
    },
    {
      name: 'pymorphy2',
      version: '0.9.1',
      installedVersion: 'v0.9.1',
      latestVersion: 'v0.9.1',
      status: 'GHOST',
      riskLevel: 'critical',
      riskAssessment: 'Critical (Discordant Ghost: Inactivity > 2,000d)',
      healthIndicators: ['Discordant Ghost', 'Zero Commits > 2000d', 'Maintainers Abandoned'],
      type: 'runtime',
      description: 'Morphological analyzer. Version says "alive" (at latest 0.9.1), but repository has been abandoned since 2018.',
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
    },
    {
      name: 'torch',
      version: '2.3.1',
      installedVersion: 'v2.3.1',
      latestVersion: 'v2.4.0',
      status: 'HEALTHY',
      riskLevel: 'low',
      riskAssessment: 'Low (Active Fast-Moving Runtime)',
      healthIndicators: ['Active Commits', 'Pinned', 'CUDA 12.1 Ready'],
      type: 'runtime',
      description: 'PyTorch deep learning core runtime.',
      lastCommit: '3 days ago',
      versionLagDays: 14,
      maintenanceLagDays: 3,
      isDiscordant: false,
      dasScore: 98,
      mrsScore: 95,
      rmvsScore: 100,
      maltaScore: 97.2,
      dasDetails: { lambdaRatio: 1.0, tLastDays: 3, decayFactor: 0.983 },
      mrsDetails: { rDec: 0.96, dDec: 0.02, pStale: 0.03 },
      rmvsDetails: { stars: 0.99, forks: 0.98, watchers: 0.97, hasLicense: true, aPen: 1.0 }
    },
    {
      name: 'transformers',
      version: '4.41.2',
      installedVersion: 'v4.41.2',
      latestVersion: 'v4.42.0',
      status: 'HEALTHY',
      riskLevel: 'low',
      riskAssessment: 'Low (Active Foundation Library)',
      healthIndicators: ['High Cadence', 'Apache 2.0', 'Triage Daily'],
      type: 'runtime',
      description: 'HuggingFace state-of-the-art transformer models.',
      lastCommit: 'Yesterday',
      versionLagDays: 0,
      maintenanceLagDays: 1,
      isDiscordant: false,
      dasScore: 99,
      mrsScore: 94,
      rmvsScore: 98,
      maltaScore: 97.2,
      dasDetails: { lambdaRatio: 1.0, tLastDays: 1, decayFactor: 0.994 },
      mrsDetails: { rDec: 0.95, dDec: 0.02, pStale: 0.04 },
      rmvsDetails: { stars: 0.98, forks: 0.97, watchers: 0.95, hasLicense: true, aPen: 1.0 }
    },
    {
      name: 'pycrypto',
      version: '2.6.1',
      installedVersion: 'v2.6.1',
      latestVersion: 'v2.6.1',
      status: 'GHOST',
      riskLevel: 'critical',
      riskAssessment: 'Critical (Discordant Ghost: Inactivity > 4,000d)',
      healthIndicators: ['Discordant Ghost', 'CVE Vulnerabilities', 'Dead Repository'],
      type: 'transitive',
      description: 'Discordant Ghost: On latest version (2.6.1) but maintenance lag > 4,000 days.',
      lastCommit: '11 years ago',
      upstreamPypi: 'Deprecation flag set',
      versionLagDays: 0,
      maintenanceLagDays: 4120,
      isDiscordant: true, // Ghost package!
      dasScore: 0,
      mrsScore: 0,
      rmvsScore: 20,
      maltaScore: 2.0,
      dasDetails: { lambdaRatio: 0.0, tLastDays: 4120, decayFactor: 0.0 },
      mrsDetails: { rDec: 0.0, dDec: 0.6, pStale: 0.95 },
      rmvsDetails: { stars: 0.3, forks: 0.2, watchers: 0.2, hasLicense: true, aPen: 0.2 }
    }
  ],
  issues: [
    {
      id: 'MALTA-GHOST-01',
      pillar: 'DISCORDANT',
      pillarLabel: 'Special Sauce: Discordant Detection',
      severity: 'critical',
      title: 'Discordant Ghost Package Detected: pycrypto',
      description: 'Version lag is LOW (installed v2.6.1 is latest PyPI release), but Maintenance lag is HIGH (4,120+ days without a commit). Version says "alive", but repo is dead!',
      impact: 'Unmaintained C-extension with 8 known CVE vulnerabilities; will fail compilation on modern GCC/Clang.',
      formulaNote: 'Version lag = LOW ∧ Maintenance lag > 365d → Discordant Ghost',
      remediationCode: 'pip uninstall pycrypto && pip install cryptography'
    },
    {
      id: 'MALTA-DAS-02',
      pillar: 'DAS',
      pillarLabel: 'Development Activity (55%)',
      severity: 'high',
      title: 'Exponential Inactivity Decay in scikit-survival',
      description: 't_last = 440 days since last commit. Exceeds the 180-day half-life threshold.',
      impact: 'Exponential penalty e^(-440/180) drops the DAS score by 91.4%.',
      formulaNote: 'DAS = min(1, λe/λb) × e^(-t_last/180)',
      remediationCode: 'Upgrade to active fork or replace with lifelines==0.29.0'
    },
    {
      id: 'MALTA-MRS-03',
      pillar: 'MRS',
      pillarLabel: 'Maintainer Responsiveness (35%)',
      severity: 'moderate',
      title: 'Elevated Stale Issue Backlog (P_stale)',
      description: 'Maintainer response rate R_dec remains high, but 4% of pull requests are unmerged without triage.',
      impact: 'MRS score multiplied by (1 - P_stale), applying a proportional drag.',
      formulaNote: 'MRS = R_dec × (1 - D_dec) × (1 - P_stale)',
      remediationCode: undefined
    },
    {
      id: 'MALTA-RMVS-04',
      pillar: 'RMVS',
      pillarLabel: 'Metadata Viability (10%)',
      severity: 'verified',
      title: 'OSI-Approved License & Metadata Verified',
      description: 'Open source Apache-2.0 / MIT license active; A_pen multiplier is 1.0 (unarchived).',
      impact: 'Provides full 10% RMVS contribution to the collective score.',
      formulaNote: 'RMVS = A_pen × (0.25*Stars + 0.25*Forks + 0.25*Watchers + 0.25*License)',
      remediationCode: undefined
    }
  ],
  decayCurveData: generateDecayCurve(16),
  pillarComparisonData: [
    {
      pillar: 'DAS',
      fullName: 'Development Activity',
      weightPercent: 55,
      rawScore: 92.0,
      weightedContribution: 50.6,
      benchmark: 85
    },
    {
      pillar: 'MRS',
      fullName: 'Maintainer Responsiveness',
      weightPercent: 35,
      rawScore: 86.0,
      weightedContribution: 30.1,
      benchmark: 80
    },
    {
      pillar: 'RMVS',
      fullName: 'Metadata Viability',
      weightPercent: 10,
      rawScore: 95.0,
      weightedContribution: 9.5,
      benchmark: 90
    }
  ],
  discordantMatrixData: [
    { name: 'torch', versionLagScore: 98, maintenanceLagDays: 3, isGhost: false, status: 'Healthy' },
    { name: 'transformers', versionLagScore: 100, maintenanceLagDays: 1, isGhost: false, status: 'Healthy' },
    { name: 'accelerate', versionLagScore: 95, maintenanceLagDays: 7, isGhost: false, status: 'Healthy' },
    { name: 'scipy', versionLagScore: 90, maintenanceLagDays: 4, isGhost: false, status: 'Unpinned' },
    { name: 'scikit-survival', versionLagScore: 80, maintenanceLagDays: 440, isGhost: true, status: 'Discordant' },
    { name: 'pycrypto', versionLagScore: 100, maintenanceLagDays: 4120, isGhost: true, status: 'Discordant Ghost' }
  ]
};
