import { useState, useEffect } from 'react';
import { Filter, RotateCcw, MapPin, AlertTriangle, Calendar, Layers } from 'lucide-react';
import type { GISFiltersState, DistressType, DistressSeverity } from '../../types/gis';
import './GISFilters.css';

interface GISFiltersProps {
  initialFilters: GISFiltersState;
  onApply: (filters: GISFiltersState) => void;
  onReset: () => void;
}

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
  'Karnataka': ['Bengaluru', 'Mysore', 'Hubli', 'Mangaluru'],
  'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy'],
};

const DISTRESS_TYPES: { value: DistressType; label: string }[] = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'crack', label: 'Crack (Alligator/Longitudinal)' },
  { value: 'raveling', label: 'Raveling' },
  { value: 'rutting', label: 'Rutting' },
  { value: 'shoving', label: 'Shoving' },
  { value: 'bleeding', label: 'Bleeding' },
];

const SEVERITIES: { value: DistressSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function GISFilters({ initialFilters, onApply, onReset }: GISFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GISFiltersState>({ ...initialFilters });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Update local filters if initialFilters change (e.g. on parent reset)
  useEffect(() => {
    setLocalFilters({ ...initialFilters });
  }, [initialFilters]);

  // Update available districts when state changes
  useEffect(() => {
    if (localFilters.state && STATES_AND_DISTRICTS[localFilters.state]) {
      setAvailableDistricts(STATES_AND_DISTRICTS[localFilters.state]);
      // If the currently selected district is not in the new state's districts, reset it
      if (!STATES_AND_DISTRICTS[localFilters.state].includes(localFilters.district)) {
        setLocalFilters(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setLocalFilters(prev => ({ ...prev, district: '' }));
    }
  }, [localFilters.state]);

  const handleChange = (field: keyof GISFiltersState, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleResetClick = () => {
    onReset();
  };

  return (
    <aside className="gis-filters" aria-label="GIS Map Filters">
      <div className="gis-filters__header">
        <Filter className="gis-filters__header-icon" size={18} />
        <h2 className="gis-filters__header-title">Filter Distress Data</h2>
      </div>

      <form className="gis-filters__form" onSubmit={handleApply}>
        {/* State Dropdown */}
        <div className="gis-filters__group">
          <label className="gis-filters__label" htmlFor="filter-state">
            <MapPin size={14} className="gis-filters__label-icon" /> State
          </label>
          <select
            id="filter-state"
            className="gis-filters__select"
            value={localFilters.state}
            onChange={(e) => handleChange('state', e.target.value)}
          >
            <option value="">All States</option>
            {Object.keys(STATES_AND_DISTRICTS).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div className="gis-filters__group">
          <label className="gis-filters__label" htmlFor="filter-district">
            <MapPin size={14} className="gis-filters__label-icon" /> District
          </label>
          <select
            id="filter-district"
            className="gis-filters__select"
            value={localFilters.district}
            onChange={(e) => handleChange('district', e.target.value)}
            disabled={!localFilters.state}
          >
            <option value="">
              {!localFilters.state ? 'Select State First' : 'All Districts'}
            </option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Distress Type Dropdown */}
        <div className="gis-filters__group">
          <label className="gis-filters__label" htmlFor="filter-distress-type">
            <Layers size={14} className="gis-filters__label-icon" /> Distress Type
          </label>
          <select
            id="filter-distress-type"
            className="gis-filters__select"
            value={localFilters.distressType}
            onChange={(e) => handleChange('distressType', e.target.value)}
          >
            <option value="">All Types</option>
            {DISTRESS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Dropdown */}
        <div className="gis-filters__group">
          <label className="gis-filters__label" htmlFor="filter-severity">
            <AlertTriangle size={14} className="gis-filters__label-icon" /> Severity Level
          </label>
          <select
            id="filter-severity"
            className="gis-filters__select"
            value={localFilters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((severity) => (
              <option key={severity.value} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Inputs */}
        <div className="gis-filters__group">
          <label className="gis-filters__label">
            <Calendar size={14} className="gis-filters__label-icon" /> Date Range
          </label>
          <div className="gis-filters__date-range">
            <div className="gis-filters__date-input-wrapper">
              <span className="gis-filters__date-sublabel">From</span>
              <input
                type="date"
                id="filter-start-date"
                className="gis-filters__date-input"
                value={localFilters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                aria-label="Start Date"
              />
            </div>
            <div className="gis-filters__date-input-wrapper">
              <span className="gis-filters__date-sublabel">To</span>
              <input
                type="date"
                id="filter-end-date"
                className="gis-filters__date-input"
                value={localFilters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                aria-label="End Date"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="gis-filters__actions">
          <button type="submit" className="gis-filters__btn-apply">
            Apply Filters
          </button>
          <button
            type="button"
            className="gis-filters__btn-reset"
            onClick={handleResetClick}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
