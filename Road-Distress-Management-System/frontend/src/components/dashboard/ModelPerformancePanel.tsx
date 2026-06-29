import { ArrowUp, Calendar, Cpu, ShieldCheck, Database, Sliders } from 'lucide-react';
import './ModelPerformancePanel.css';

interface MetricItem {
  label: string;
  value: number; // percentage
  trend: number; // percentage change
  description: string;
  color: string;
}

export default function ModelPerformancePanel() {
  const metrics: MetricItem[] = [
    { label: 'Accuracy', value: 94.8, trend: 1.2, description: 'Overall correct classification rate', color: '#10b981' }, // Green
    { label: 'Precision', value: 95.2, trend: 0.4, description: 'True positive detection ratio', color: '#3b82f6' }, // Blue
    { label: 'Recall', value: 93.8, trend: 0.9, description: 'Distress identification coverage', color: '#c084fc' }, // Purple
    { label: 'F1 Score', value: 94.5, trend: 0.6, description: 'Harmonic mean of precision/recall', color: '#f59e0b' }, // Amber
    { label: 'mAP@50', value: 96.1, trend: 1.5, description: 'Mean Average Precision at IoU=0.50', color: '#ec4899' }, // Pink
    { label: 'mAP@50-95', value: 78.4, trend: 2.1, description: 'mAP averaged across IoU 0.50 to 0.95', color: '#14b8a6' }, // Teal
  ];

  // SVG parameters for circular indicator
  const radius = 26;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="model-perf" aria-labelledby="perf-title">
      <header className="model-perf__header">
        <div className="model-perf__header-title">
          <ShieldCheck className="model-perf__icon text-amber" size={18} />
          <h2 id="perf-title" className="model-perf__title">
            Model Performance Metrics
          </h2>
        </div>
        <div className="model-perf__model-tag">
          <Cpu size={12} className="text-purple" />
          <span>YOLOv11x Active</span>
        </div>
      </header>

      <div className="model-perf__body">
        {/* Metrics Circle Grid */}
        <div className="model-perf__grid" role="grid" aria-label="Model statistics">
          {metrics.map((m, idx) => {
            const strokeDashoffset = circumference - (m.value / 100) * circumference;

            return (
              <div key={idx} className="model-perf__card" role="gridcell">
                <div className="model-perf__card-content">
                  <div className="model-perf__card-info">
                    <span className="model-perf__card-label">{m.label}</span>
                    <span className="model-perf__card-desc">{m.description}</span>
                  </div>

                  <div className="model-perf__card-visual">
                    {/* SVG Circle Progress */}
                    <div className="model-perf__circle-wrapper">
                      <svg className="model-perf__circle-svg" width="60" height="60">
                        <circle
                          className="model-perf__circle-bg"
                          cx="30"
                          cy="30"
                          r={radius}
                          strokeWidth={strokeWidth}
                        />
                        <circle
                          className="model-perf__circle-fill"
                          cx="30"
                          cy="30"
                          r={radius}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          stroke={m.color}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                      </svg>
                      <span className="model-perf__circle-value" style={{ color: m.color }}>
                        {m.value}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="model-perf__card-footer">
                  <div className="model-perf__trend text-green">
                    <ArrowUp size={12} className="model-perf__trend-icon" />
                    <span>+{m.trend}% vs prev run</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* YOLOv11 Metadata Panel */}
        <div className="model-perf__meta">
          <h3 className="model-perf__meta-title">AI Engine Specifications</h3>
          
          <div className="model-perf__meta-grid">
            <div className="model-perf__meta-item">
              <div className="model-perf__meta-item-header">
                <Cpu size={14} className="text-purple" />
                <span className="model-perf__meta-label">Architecture</span>
              </div>
              <span className="model-perf__meta-value">YOLOv11x (Extra Large)</span>
            </div>

            <div className="model-perf__meta-item">
              <div className="model-perf__meta-item-header">
                <Sliders size={14} className="text-amber" />
                <span className="model-perf__meta-label">Input Resolution</span>
              </div>
              <span className="model-perf__meta-value font-mono">640 x 640 px</span>
            </div>

            <div className="model-perf__meta-item">
              <div className="model-perf__meta-item-header">
                <Database size={14} className="text-blue" />
                <span className="model-perf__meta-label">Training Dataset</span>
              </div>
              <span className="model-perf__meta-value">18,500 frames (annotated)</span>
            </div>

            <div className="model-perf__meta-item">
              <div className="model-perf__meta-item-header">
                <Calendar size={14} className="text-green" />
                <span className="model-perf__meta-label">Last Training Run</span>
              </div>
              <span className="model-perf__meta-value">2026-06-15 18:30 UTC</span>
            </div>
          </div>

          <div className="model-perf__meta-footer">
            <span className="model-perf__meta-footer-text">
              Active optimization parameters: Backbone CSPSwin-Transformer, Optimizer AdamW (lr=1e-3, weight_decay=1e-4).
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
