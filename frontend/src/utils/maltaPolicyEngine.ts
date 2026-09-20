import { DependencyNode } from '../types';

export interface RemediationSolution {
  packageName: string;
  installedVersion: string;
  latestVersion: string;
  lagType: 'DISCORDANT_GHOST' | 'TERMINAL_ABANDONED' | 'RESOLVABLE_DRIFT' | 'SUSTAINED_HEALTHY';
  lagTypeLabel: string;
  lagTypeBadgeClass: string;
  maltaScore: number;
  maintenanceLagDays: number;
  versionLagDays: number;
  diagnosis: string;
  primaryAction: {
    title: string;
    description: string;
    command: string;
    feasibility: string;
    effortBadge: string;
  };
  preservationAction?: {
    title: string;
    description: string;
    snippet: string;
    type: 'docker' | 'git' | 'lock';
  };
}

const KNOWN_COMMON_REPLACEMENTS: Record<string, {
  successor: string;
  installCmd: string;
  description: string;
  feasibility: string;
}> = {
  'pymorphy2': {
    successor: 'pymorphy3',
    installCmd: 'pip uninstall -y pymorphy2 && pip install pymorphy3',
    description: 'Direct community fork with 100% backward-compatible API, supporting modern Python 3.10+ runtimes.',
    feasibility: 'Zero code refactoring (imports continue to use pymorphy2)'
  },
  'pycrypto': {
    successor: 'pycryptodome',
    installCmd: 'pip uninstall -y pycrypto && pip install pycryptodome',
    description: 'Active drop-in replacement resolving unpatched CVEs and deprecated Python C-API bindings.',
    feasibility: 'Drop-in replacement with Cryptodome compatibility bridge'
  },
  'sklearn': {
    successor: 'scikit-learn',
    installCmd: 'pip uninstall -y sklearn && pip install scikit-learn',
    description: 'The "sklearn" PyPI alias was deprecated; install the official canonical package.',
    feasibility: 'Instant fix (0 code changes)'
  },
  'flask-restplus': {
    successor: 'flask-restx',
    installCmd: 'pip uninstall -y flask-restplus && pip install flask-restx',
    description: 'Community-driven successor fork maintaining full OpenAPI compatibility.',
    feasibility: 'Low effort (replace flask_restplus with flask_restx in imports)'
  },
  'pep8': {
    successor: 'pycodestyle',
    installCmd: 'pip uninstall -y pep8 && pip install pycodestyle',
    description: 'Renamed by Python core guidelines; pycodestyle is the official modern successor.',
    feasibility: 'Zero code refactoring'
  },
  'PIL': {
    successor: 'pillow',
    installCmd: 'pip uninstall -y PIL && pip install pillow',
    description: 'Original PIL was discontinued; Pillow is the modern imaging standard.',
    feasibility: 'Drop-in replacement'
  }
};

function getEraPython(maintenanceLagDays: number): string {
  // Compute the approximate active runtime era based on days since last commit
  if (maintenanceLagDays > 2200) return '3.7-slim-buster';
  if (maintenanceLagDays > 1400) return '3.8-slim-buster';
  if (maintenanceLagDays > 730) return '3.9-slim-bullseye';
  if (maintenanceLagDays > 365) return '3.10-slim-bullseye';
  return '3.11-slim-bookworm';
}

export function synthesizeRemediation(dep: DependencyNode): RemediationSolution {
  const name = dep.name.toLowerCase().trim();
  const rawScore = dep.maltaScore ?? 50;
  const mLag = dep.maintenanceLagDays || 0;
  const vLag = dep.versionLagDays || 0;
  const isDiscordant = Boolean(dep.isDiscordant);
  const isArchived = Boolean(dep.rmvsDetails && (dep.rmvsDetails as any).archived);
  const eraPython = getEraPython(mLag);

  // 1. DISCORDANT GHOST (Zero/Low version lag, but long maintenance inactivity > 365d)
  if (isDiscordant || (vLag <= 30 && mLag > 365)) {
    const common = KNOWN_COMMON_REPLACEMENTS[name];
    if (common) {
      return {
        packageName: dep.name,
        installedVersion: dep.installedVersion || dep.version,
        latestVersion: dep.latestVersion || dep.version,
        lagType: 'DISCORDANT_GHOST',
        lagTypeLabel: 'DISCORDANT GHOST',
        lagTypeBadgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
        maltaScore: rawScore,
        maintenanceLagDays: mLag,
        versionLagDays: vLag,
        diagnosis: `Version lag is low (${vLag}d), but upstream repository has been unmaintained for ${mLag} days (MALTA: ${rawScore}). Upstream release currency masks terminal abandonment.`,
        primaryAction: {
          title: `Migrate to Successor Fork (${common.successor})`,
          description: common.description,
          command: common.installCmd,
          feasibility: common.feasibility,
          effortBadge: 'Low Effort (Drop-in)'
        },
        preservationAction: {
          title: 'Deterministic Container Isolation',
          description: `Freeze this environment to prevent upstream wheel distribution breakage:`,
          snippet: `FROM python:${eraPython}\nRUN ${common.installCmd}`,
          type: 'docker'
        }
      };
    }

    // Generic / Uncommon Discordant Package
    return {
      packageName: dep.name,
      installedVersion: dep.installedVersion || dep.version,
      latestVersion: dep.latestVersion || dep.version,
      lagType: 'DISCORDANT_GHOST',
      lagTypeLabel: 'DISCORDANT GHOST',
      lagTypeBadgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
      maltaScore: rawScore,
      maintenanceLagDays: mLag,
      versionLagDays: vLag,
      diagnosis: `Dependency exhibits 0 version lag, yet shows ${mLag} days of maintenance cessation. No public successor is registered for this package.`,
      primaryAction: {
        title: 'Vendor Dependency & Lock Transitive Hashes',
        description: 'Freeze the exact package binary and submodule vendor the repository to protect against repository deletion or wheel retraction.',
        command: `pip-compile --generate-hashes -P ${dep.name}==${dep.version || 'latest'}`,
        feasibility: 'Containment (Preserves exact working state)',
        effortBadge: 'Hash Pinning'
      },
      preservationAction: {
        title: `Era-Locked Container (${eraPython})`,
        description: `Build inside the runtime era active during last verified maintenance (${mLag} days ago):`,
        snippet: `FROM python:${eraPython}\nCOPY requirements.lock .\nRUN pip install --no-cache-dir --require-hashes -r requirements.lock`,
        type: 'docker'
      }
    };
  }

  // 2. TERMINAL LAG: ABANDONED / ARCHIVED (Low MALTA Score or Archived)
  if (isArchived || rawScore < 30 || mLag > 1095) {
    const common = KNOWN_COMMON_REPLACEMENTS[name];
    if (common) {
      return {
        packageName: dep.name,
        installedVersion: dep.installedVersion || dep.version,
        latestVersion: dep.latestVersion || dep.version,
        lagType: 'TERMINAL_ABANDONED',
        lagTypeLabel: 'TERMINAL LAG: ABANDONED',
        lagTypeBadgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
        maltaScore: rawScore,
        maintenanceLagDays: mLag,
        versionLagDays: vLag,
        diagnosis: `Upstream maintenance has permanently ceased (${mLag} days lag, MALTA: ${rawScore}). Terminal technical lag: no future upstream security patches will be published.`,
        primaryAction: {
          title: `Replace with Active Successor (${common.successor})`,
          description: common.description,
          command: common.installCmd,
          feasibility: common.feasibility,
          effortBadge: 'Recommended Fix'
        },
        preservationAction: {
          title: 'Containerization Fallback',
          description: 'If replacement is deferred, encapsulate legacy runtime:',
          snippet: `FROM python:${eraPython}\nRUN pip install ${dep.name}==${dep.version}`,
          type: 'docker'
        }
      };
    }

    // Generic / Uncommon Abandoned Package
    return {
      packageName: dep.name,
      installedVersion: dep.installedVersion || dep.version,
      latestVersion: dep.latestVersion || dep.version,
      lagType: 'TERMINAL_ABANDONED',
      lagTypeLabel: 'TERMINAL LAG: ABANDONED',
      lagTypeBadgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      maltaScore: rawScore,
      maintenanceLagDays: mLag,
      versionLagDays: vLag,
      diagnosis: `Terminal technical lag: package shows near-zero development activity (${mLag} days lag). No public successor fork exists for this library.`,
      primaryAction: {
        title: 'Immutable Git / Hash Lockdown',
        description: 'Pin the dependency to its immutable commit SHA and capture repository snapshot in Software Heritage to guard against project deletion.',
        command: dep.repositoryUrl ? `git clone ${dep.repositoryUrl} vendor/${dep.name}` : `pip install --no-deps ${dep.name}==${dep.version}`,
        feasibility: 'Scientific Preservation (Guarantees reproducible build)',
        effortBadge: 'Preservation Lock'
      },
      preservationAction: {
        title: `Reproducibility Container (${eraPython})`,
        description: 'Encapsulate the frozen library within its supported compiler/glibc environment:',
        snippet: `FROM python:${eraPython}\nRUN pip install --no-cache-dir ${dep.name}==${dep.version}`,
        type: 'docker'
      }
    };
  }

  // 3. RESOLVABLE LAG: VERSION DRIFT (Healthy upstream, but project pin is outdated)
  if (vLag > 180 || (dep.latestVersion && dep.installedVersion && dep.latestVersion !== dep.installedVersion)) {
    return {
      packageName: dep.name,
      installedVersion: dep.installedVersion || dep.version,
      latestVersion: dep.latestVersion || 'latest',
      lagType: 'RESOLVABLE_DRIFT',
      lagTypeLabel: 'RESOLVABLE LAG: VERSION DRIFT',
      lagTypeBadgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      maltaScore: rawScore,
      maintenanceLagDays: mLag,
      versionLagDays: vLag,
      diagnosis: `Upstream is actively maintained (MALTA: ${rawScore}, ${mLag}d lag), but your local project pin lags by ${vLag} days behind release ${dep.latestVersion || 'latest'}.`,
      primaryAction: {
        title: `Upgrade to Latest Verified Release (${dep.latestVersion || 'latest'})`,
        description: 'Upstream maintainers are actively resolving issues and issuing patches. Safe upgrade path is available.',
        command: `pip install --upgrade ${dep.name}==${dep.latestVersion || 'latest'}`,
        feasibility: 'Standard SemVer upgrade (run test suite for deprecation warnings)',
        effortBadge: 'Resolvable Upgrade'
      }
    };
  }

  // 4. SUSTAINED STEWARDSHIP (Healthy)
  return {
    packageName: dep.name,
    installedVersion: dep.installedVersion || dep.version,
    latestVersion: dep.latestVersion || dep.version,
    lagType: 'SUSTAINED_HEALTHY',
    lagTypeLabel: 'SUSTAINED STEWARDSHIP',
    lagTypeBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    maltaScore: rawScore,
    maintenanceLagDays: mLag,
    versionLagDays: vLag,
    diagnosis: `Sustained maintenance verified (MALTA: ${rawScore}, ${mLag}d maintenance lag). Package is actively governed and version-concordant.`,
    primaryAction: {
      title: 'Generate Hash-Enforced Lockfile',
      description: 'Lock transitive dependencies to guard against unseeded future drift.',
      command: `pip-compile --generate-hashes -P ${dep.name}==${dep.version}`,
      feasibility: 'Preventive hardening',
      effortBadge: 'Maintained'
    }
  };
}
