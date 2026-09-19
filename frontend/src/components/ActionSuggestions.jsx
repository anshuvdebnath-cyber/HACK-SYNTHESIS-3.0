import React from 'react';
import { Lightbulb, AlertOctagon, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export default function ActionSuggestions({ pkg }) {
  if (!pkg) return null;

  // Generate tailored technical remediation suggestions based directly on backend outputs
  const getSuggestions = () => {
    const list = [];

    if (pkg.isZombie) {
      list.push({
        severity: 'critical',
        title: 'CRITICAL: Replace Zombie Software Immediately',
        body: `This package receives over 100,000 monthly downloads but has had zero maintenance for ${pkg.maintenanceLagDays} days. Upstream maintainers have permanently abandoned it. Security CVEs and Python compatibility issues will never be resolved.`,
        action: 'Find an active community fork or modern alternative library.'
      });
    }

    if (pkg.isDiscordant) {
      list.push({
        severity: 'warning',
        title: 'DISCORDANT DEPENDENCY: Upstream Maintenance Decoupled',
        body: 'You are using the latest published version, yet the repository behind it is dormant (Final Score < 40). Version lag gives a false sense of security while maintenance lag is critical.',
        action: 'Pin dependency strictly in requirements.txt and prepare migration fallback.'
      });
    }

    if (pkg.dasDetails?.velocityDecay < 0.4 && !pkg.isZombie) {
      list.push({
        severity: 'advisory',
        title: 'Velocity Plunge Detected',
        body: `Commit velocity dropped by ${((1 - pkg.dasDetails.velocityDecay) * 100).toFixed(0)}% between observation windows. The project may be winding down into unannounced maintenance mode.`,
        action: 'Inspect recent GitHub issues for maintainer succession plans.'
      });
    }

    if (pkg.mrsDetails?.Pstale > 0.5) {
      list.push({
        severity: 'advisory',
        title: 'Severe Pull Request Staleness (>50%)',
        body: 'Over half of open community pull requests have been untouched for >30 days. Maintainer responsiveness to community contributions is significantly impaired.',
        action: 'Do not rely on upstream merging bug fixes; maintain an internal patch branch if necessary.'
      });
    }

    if (pkg.proofOverride) {
      list.push({
        severity: 'positive',
        title: 'Verified Mature & Stable Utility',
        body: 'Low commit velocity was compensated by heavy real-world adoption and a verified maintainer pulse within the last 2 years. This library is stable and safe for production.',
        action: 'No action needed. Component is healthy and actively watched.'
      });
    }

    if (pkg.finalScore >= 70 && !pkg.proofOverride) {
      list.push({
        severity: 'positive',
        title: 'Highly Maintained & Vibrant Dependency',
        body: 'Strong developer velocity, fast PR turnaround, and active community engagement. Excellent software health profile.',
        action: 'Safe for core production dependencies.'
      });
    }

    return list;
  };

  const suggestions = getSuggestions();

  return (
    <div className="swiss-card p-5 mb-8">
      <div className="flex items-center gap-2 border-b border-[#E3DED4] pb-3 mb-3">
        <Lightbulb className="w-4 h-4 text-[#141413]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413]">
          Actionable Remediation & Problem Suggestions
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            className={`p-3.5 border ${
              item.severity === 'critical'
                ? 'bg-red-50/70 border-red-200 text-red-900'
                : item.severity === 'warning'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : item.severity === 'positive'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-[#FAF8F5] border-[#E3DED4] text-[#141413]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {item.severity === 'critical' && <ShieldAlert className="w-4 h-4 mt-0.5 text-red-700 shrink-0" />}
              {item.severity === 'warning' && <AlertOctagon className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />}
              {item.severity === 'positive' && <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" />}
              {item.severity === 'advisory' && <Info className="w-4 h-4 mt-0.5 text-[#6E6A63] shrink-0" />}

              <div className="flex-1">
                <div className="text-xs font-bold font-mono uppercase">{item.title}</div>
                <p className="text-[11px] mt-1 leading-relaxed">{item.body}</p>
                <div className="mt-2 text-[10px] font-mono font-bold tracking-wider uppercase border-t border-black/10 pt-1.5">
                  Recommendation: {item.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
