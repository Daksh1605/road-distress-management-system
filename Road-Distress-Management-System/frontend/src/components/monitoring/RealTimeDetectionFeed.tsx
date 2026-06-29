import { useEffect, useRef, useState } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  CornerRightDown, 
  Layers, 
  Compass, 
  AlertCircle,
  HelpCircle,
  ArrowDown
} from 'lucide-react';
import './RealTimeDetectionFeed.css';

export interface FeedDetection {
  id: string;
  time: string;
  roadId: string;
  distressType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  coordinates: string;
}

interface RealTimeDetectionFeedProps {
  detections?: FeedDetection[];
  isMonitoringActive?: boolean;
}

export default function RealTimeDetectionFeed({ detections: propDetections, isMonitoringActive = true }: RealTimeDetectionFeedProps) {
  const [internalDetections, setInternalDetections] = useState<FeedDetection[]>([
    { id: 'DET-7201', time: '16:05:12', roadId: 'RD-48102', distressType: 'Pothole', severity: 'Critical', confidence: 94, coordinates: '18.7342, 73.4211' },
    { id: 'DET-7202', time: '16:06:40', roadId: 'RD-10294', distressType: 'Alligator Cracks', severity: 'High', confidence: 88, coordinates: '18.8912, 73.2045' },
    { id: 'DET-7203', time: '16:07:15', roadId: 'RD-48301', distressType: 'Rutting', severity: 'Medium', confidence: 85, coordinates: '18.7120, 73.4489' },
    { id: 'DET-7204', time: '16:08:02', roadId: 'RD-40291', distressType: 'Edge Break', severity: 'Low', confidence: 81, coordinates: '18.6541, 73.5122' },
  ]);

  const [autoScrollActive, setAutoScrollActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(7205);

  const activeDetections = propDetections || internalDetections;

  // 1. Simulation loop if propDetections are not supplied (standalone mode)
  useEffect(() => {
    if (propDetections) return; // Use props if provided

    let intervalId: any;
    if (isMonitoringActive) {
      const roads = ['RD-48102', 'RD-10294', 'RD-48301', 'RD-40291', 'RD-55102', 'RD-88492'];
      const distresses = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
      const severities: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];

      intervalId = setInterval(() => {
        const randomRoad = roads[Math.floor(Math.random() * roads.length)];
        const randomType = distresses[Math.floor(Math.random() * distresses.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        const randomConf = Math.floor(80 + Math.random() * 18);
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        // Generate random coordinates near coordinates template
        const lat = (18.7 + Math.random() * 0.2).toFixed(4);
        const lng = (73.3 + Math.random() * 0.2).toFixed(4);

        const newDet: FeedDetection = {
          id: `DET-${nextIdRef.current++}`,
          time: timestamp,
          roadId: randomRoad,
          distressType: randomType,
          severity: randomSeverity,
          confidence: randomConf,
          coordinates: `${lat}, ${lng}`,
        };

        setInternalDetections(prev => [...prev.slice(-19), newDet]); // Keep last 20 elements and append at the end
      }, 3000);
    }

    return () => clearInterval(intervalId);
  }, [propDetections, isMonitoringActive]);

  // 2. Auto-scroll to bottom as new items append
  useEffect(() => {
    if (autoScrollActive && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeDetections, autoScrollActive]);

  // Handle user scroll intervention (pause autoscroll if user scrolls up)
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Check if scrolled near the bottom (within 30px buffer)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScrollActive(isAtBottom);
  };

  // Icon mapping helper
  const getDistressIcon = (type: string, severity: string) => {
    const iconSize = 16;
    const colorClass = `text-${severity.toLowerCase()}`;
    
    switch (type.toLowerCase()) {
      case 'pothole':
        return <AlertTriangle size={iconSize} className={colorClass} />;
      case 'alligator cracks':
      case 'longitudinal cracks':
      case 'cracks':
        return <AlertCircle size={iconSize} className={colorClass} />;
      case 'rutting':
        return <Activity size={iconSize} className={colorClass} />;
      case 'edge break':
        return <CornerRightDown size={iconSize} className={colorClass} />;
      case 'patch':
        return <Layers size={iconSize} className={colorClass} />;
      default:
        return <HelpCircle size={iconSize} className={colorClass} />;
    }
  };

  return (
    <article className="rt-feed" aria-labelledby="rt-feed-title">
      <header className="rt-feed__header">
        <h3 id="rt-feed-title" className="rt-feed__title">
          Real-Time Detection Feed
        </h3>
        <div className="rt-feed__actions">
          {!autoScrollActive && (
            <button 
              className="rt-feed__scroll-btn"
              onClick={() => setAutoScrollActive(true)}
              title="Auto-scroll to bottom"
            >
              <ArrowDown size={10} />
              <span>Resume Auto-Scroll</span>
            </button>
          )}
          <span className="rt-feed__badge">
            Telemetry Stream Active
          </span>
        </div>
      </header>

      <div 
        className="rt-feed__body" 
        ref={containerRef} 
        onScroll={handleScroll}
      >
        <div className="rt-feed__list">
          {activeDetections.map((det) => (
            <div 
              key={det.id} 
              className={`rt-card border-left-${det.severity.toLowerCase()}`}
            >
              <div className="rt-card__header">
                <div className="rt-card__id-group">
                  {getDistressIcon(det.distressType, det.severity)}
                  <span className="rt-card__id font-mono">{det.id}</span>
                </div>
                <span className="rt-card__time font-mono">[{det.time}]</span>
              </div>

              <div className="rt-card__body">
                <div className="rt-card__row">
                  <span className="rt-card__label">Road ID</span>
                  <span className="rt-card__value font-bold">{det.roadId}</span>
                </div>
                <div className="rt-card__row">
                  <span className="rt-card__label">Distress Type</span>
                  <span className="rt-card__value text-slate-100">{det.distressType}</span>
                </div>
                <div className="rt-card__row">
                  <span className="rt-card__label">Severity</span>
                  <span className={`live-mon-badge live-mon-badge--${det.severity.toLowerCase()}`}>
                    {det.severity}
                  </span>
                </div>
                <div className="rt-card__row">
                  <span className="rt-card__label">Confidence</span>
                  <span className="rt-card__value font-mono text-green">{det.confidence}%</span>
                </div>
              </div>

              <div className="rt-card__footer">
                <div className="rt-card__gps">
                  <Compass size={11} className="text-blue" />
                  <span className="font-mono">{det.coordinates}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
