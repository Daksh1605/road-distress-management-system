import {
  TrendingUp,
  MapPin,
  AlertTriangle,
  Compass,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { RoadDistress } from '../../types/gis';
import './DistressSummary.css';

interface DistressSummaryProps {
  distresses: RoadDistress[];
  isLoading?: boolean;
}

export default function DistressSummary({ distresses, isLoading = false }: DistressSummaryProps) {
  const total = distresses.length;

  // Severity Counts
  const critical = distresses.filter((d) => d.severity === 'critical').length;
  const high = distresses.filter((d) => d.severity === 'high').length;
  const medium = distresses.filter((d) => d.severity === 'medium').length;
  const low = distresses.filter((d) => d.severity === 'low').length;

  // Frequency calculator helper
  const getMostFrequent = (arr: string[]): string => {
    if (arr.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    let maxCount = 0;
    let mostFrequent = '';
    for (const val of arr) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        mostFrequent = val;
      }
    }
    return mostFrequent;
  };

  // Dynamic Insights calculations
  const mostAffectedState = getMostFrequent(distresses.map((d) => d.state));
  const mostAffectedDistrict = getMostFrequent(distresses.map((d) => d.district));
  
  const rawCommonType = getMostFrequent(distresses.map((d) => d.distressType));
  const mostCommonType =
    rawCommonType !== 'N/A'
      ? rawCommonType.replace('_', ' ').charAt(0).toUpperCase() + rawCommonType.replace('_', ' ').slice(1)
      : 'N/A';

  const averageConfidence =
    total > 0
      ? Math.round(distresses.reduce((sum, d) => sum + d.confidence, 0) / total)
      : 0;

  const lastDetection = useMemoLastInspectionDate(distresses);

  function useMemoLastInspectionDate(items: RoadDistress[]): string {
    if (items.length === 0) return 'N/A';
    const sortedDates = [...items].sort(
      (a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime()
    );
    const dateStr = sortedDates[0].reportedDate;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Calculate percentage sizes for progress bars
  const getPct = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Render Loading Skeleton State
  if (isLoading) {
    return (
      <article className="distress-summary-analytics distress-summary-analytics--loading" aria-label="Loading Analytics">
        <header className="distress-summary-analytics__header">
          <div className="distress-summary-analytics__skeleton-header-icon shimmer" />
          <div className="distress-summary-analytics__skeleton-title shimmer" />
        </header>

        <div className="distress-summary-analytics__layout">
          <div className="distress-summary-analytics__metrics-pane">
            <div className="distress-summary-analytics__skeleton-total-box shimmer" />
            <div className="distress-summary-analytics__splits">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="distress-summary-analytics__skeleton-split-row">
                  <div className="distress-summary-analytics__skeleton-split-lbl shimmer" />
                  <div className="distress-summary-analytics__skeleton-split-bar shimmer" />
                </div>
              ))}
            </div>
          </div>

          <div className="distress-summary-analytics__skeleton-insights-pane shimmer" />
        </div>
      </article>
    );
  }

  return (
    <article className="distress-summary-analytics" aria-labelledby="analytics-card-title">
      <header className="distress-summary-analytics__header">
        <TrendingUp className="distress-summary-analytics__header-icon" size={18} />
        <h3 id="analytics-card-title" className="distress-summary-analytics__title">
          Distress Summary Analytics
        </h3>
      </header>

      <div className="distress-summary-analytics__layout">
        {/* Left Side: Summary metrics splits & totals */}
        <section className="distress-summary-analytics__metrics-pane" aria-label="Severity Splits">
          <div className="distress-summary-analytics__total-box">
            <span className="distress-summary-analytics__total-lbl">Total Distresses</span>
            <span className="distress-summary-analytics__total-val">{total}</span>
          </div>

          <div className="distress-summary-analytics__splits">
            {/* Critical Severity split */}
            <div className="distress-summary-analytics__split-row">
              <div className="distress-summary-analytics__split-info">
                <span className="distress-summary-analytics__split-dot distress-summary-analytics__split-dot--critical" />
                <span className="distress-summary-analytics__split-lbl">Critical</span>
                <span className="distress-summary-analytics__split-count">{critical}</span>
              </div>
              <div className="distress-summary-analytics__progress-track">
                <div
                  className="distress-summary-analytics__progress-fill distress-summary-analytics__progress-fill--critical"
                  style={{ width: `${getPct(critical)}%` }}
                  role="progressbar"
                  aria-valuenow={critical}
                  aria-valuemin={0}
                  aria-valuemax={total}
                />
              </div>
            </div>

            {/* High Severity split */}
            <div className="distress-summary-analytics__split-row">
              <div className="distress-summary-analytics__split-info">
                <span className="distress-summary-analytics__split-dot distress-summary-analytics__split-dot--high" />
                <span className="distress-summary-analytics__split-lbl">High</span>
                <span className="distress-summary-analytics__split-count">{high}</span>
              </div>
              <div className="distress-summary-analytics__progress-track">
                <div
                  className="distress-summary-analytics__progress-fill distress-summary-analytics__progress-fill--high"
                  style={{ width: `${getPct(high)}%` }}
                  role="progressbar"
                  aria-valuenow={high}
                  aria-valuemin={0}
                  aria-valuemax={total}
                />
              </div>
            </div>

            {/* Medium Severity split */}
            <div className="distress-summary-analytics__split-row">
              <div className="distress-summary-analytics__split-info">
                <span className="distress-summary-analytics__split-dot distress-summary-analytics__split-dot--medium" />
                <span className="distress-summary-analytics__split-lbl">Medium</span>
                <span className="distress-summary-analytics__split-count">{medium}</span>
              </div>
              <div className="distress-summary-analytics__progress-track">
                <div
                  className="distress-summary-analytics__progress-fill distress-summary-analytics__progress-fill--medium"
                  style={{ width: `${getPct(medium)}%` }}
                  role="progressbar"
                  aria-valuenow={medium}
                  aria-valuemin={0}
                  aria-valuemax={total}
                />
              </div>
            </div>

            {/* Low Severity split */}
            <div className="distress-summary-analytics__split-row">
              <div className="distress-summary-analytics__split-info">
                <span className="distress-summary-analytics__split-dot distress-summary-analytics__split-dot--low" />
                <span className="distress-summary-analytics__split-lbl">Low</span>
                <span className="distress-summary-analytics__split-count">{low}</span>
              </div>
              <div className="distress-summary-analytics__progress-track">
                <div
                  className="distress-summary-analytics__progress-fill distress-summary-analytics__progress-fill--low"
                  style={{ width: `${getPct(low)}%` }}
                  role="progressbar"
                  aria-valuenow={low}
                  aria-valuemin={0}
                  aria-valuemax={total}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Additional Insights Section */}
        <section className="distress-summary-analytics__insights-pane" aria-labelledby="insights-section-title">
          <h4 id="insights-section-title" className="distress-summary-analytics__section-title">
            Additional Insights
          </h4>

          <div className="distress-summary-analytics__insights-list">
            <div className="distress-summary-analytics__insight-item">
              <div className="distress-summary-analytics__insight-lbl">
                <MapPin size={14} className="distress-summary-analytics__insight-icon" />
                <span>Most Affected State</span>
              </div>
              <span className="distress-summary-analytics__insight-val">{mostAffectedState}</span>
            </div>

            <div className="distress-summary-analytics__insight-item">
              <div className="distress-summary-analytics__insight-lbl">
                <Compass size={14} className="distress-summary-analytics__insight-icon" />
                <span>Most Affected District</span>
              </div>
              <span className="distress-summary-analytics__insight-val">{mostAffectedDistrict}</span>
            </div>

            <div className="distress-summary-analytics__insight-item">
              <div className="distress-summary-analytics__insight-lbl">
                <Layers size={14} className="distress-summary-analytics__insight-icon" />
                <span>Most Common Type</span>
              </div>
              <span className="distress-summary-analytics__insight-val">{mostCommonType}</span>
            </div>

            <div className="distress-summary-analytics__insight-item">
              <div className="distress-summary-analytics__insight-lbl">
                <AlertTriangle size={14} className="distress-summary-analytics__insight-icon" />
                <span>Avg Confidence Score</span>
              </div>
              <span className="distress-summary-analytics__insight-val">
                {averageConfidence > 0 ? `${averageConfidence}%` : 'N/A'}
              </span>
            </div>

            <div className="distress-summary-analytics__insight-item">
              <div className="distress-summary-analytics__insight-lbl">
                <Calendar size={14} className="distress-summary-analytics__insight-icon" />
                <span>Last Detection Time</span>
              </div>
              <span className="distress-summary-analytics__insight-val">{lastDetection}</span>
            </div>
          </div>

          <div className="distress-summary-analytics__footer">
            <span>Dynamic updates based on current grid filtering</span>
            <ChevronRight size={12} />
          </div>
        </section>
      </div>
    </article>
  );
}
