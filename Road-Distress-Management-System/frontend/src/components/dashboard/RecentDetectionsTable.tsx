import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { RoadDistressResponse } from '../../services/api/apiService'
import './RecentDetectionsTable.css'

export type SeverityType = 'Critical' | 'High' | 'Medium' | 'Low'
export type StatusType = 'Detected' | 'Scheduled' | 'Verified' | 'Assigned' | 'Completed'

export interface RecentDetectionsTableProps {
  data: RoadDistressResponse[]
}

export default function RecentDetectionsTable({ data }: RecentDetectionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Helper to map backend values to frontend SeverityType
  const mapSeverity = (severity: string): SeverityType => {
    const s = severity.toLowerCase();
    if (s.includes('critical')) return 'Critical';
    if (s.includes('high')) return 'High';
    if (s.includes('medium')) return 'Medium';
    return 'Low';
  };

  // Helper to map backend values to frontend StatusType
  const mapStatus = (status: string): StatusType => {
    const s = status.toLowerCase();
    if (s.includes('completed')) return 'Completed';
    if (s.includes('assigned')) return 'Assigned';
    if (s.includes('scheduled')) return 'Scheduled';
    if (s.includes('verified')) return 'Verified';
    return 'Detected';
  };

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const roadId = `RD-${record.id}`;
      const locationStr = `Lat: ${record.latitude.toFixed(2)}, Lon: ${record.longitude.toFixed(2)}`;
      
      const matchesSearch =
        roadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.distress_type.toLowerCase().includes(searchTerm.toLowerCase())

      const recordSeverity = mapSeverity(record.severity);
      const matchesSeverity =
        selectedSeverity === 'All' || recordSeverity.toLowerCase() === selectedSeverity.toLowerCase()

      const recordStatus = mapStatus(record.status);
      const matchesStatus =
        selectedStatus === 'All' || recordStatus.toLowerCase() === selectedStatus.toLowerCase()

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [data, searchTerm, selectedSeverity, selectedStatus])

  const getSeverityIcon = (severity: SeverityType) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return <AlertCircle className="distress-table__icon-badge distress-table__icon-badge--high" size={14} />
      case 'Medium':
        return <AlertTriangle className="distress-table__icon-badge distress-table__icon-badge--medium" size={14} />
      case 'Low':
        return <Info className="distress-table__icon-badge distress-table__icon-badge--low" size={14} />
    }
  }

  return (
    <div className="distress-table-container">
      {/* Controls: Search and Filters */}
      <div className="distress-table-controls">
        <div className="distress-table-search-wrapper">
          <Search className="distress-table-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by Road ID, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="distress-table-search-input"
            aria-label="Search detections"
          />
        </div>
        
        <div className="distress-table-filters">
          <div className="distress-table-filter-group">
            <SlidersHorizontal size={14} className="distress-table-filter-icon" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="distress-table-select"
              aria-label="Filter by Severity"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="distress-table-filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="distress-table-select"
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              <option value="Detected">Detected</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="distress-table-wrapper">
        <table className="distress-table">
          <thead>
            <tr>
              <th scope="col">Road ID</th>
              <th scope="col">Location</th>
              <th scope="col">Distress Type</th>
              <th scope="col">Severity</th>
              <th scope="col">Confidence</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => {
                const displaySeverity = mapSeverity(record.severity);
                const displayStatus = mapStatus(record.status);
                const dateStr = record.detected_at.split('T')[0];
                return (
                  <tr key={record.id}>
                    <td className="distress-table__road-id">{`RD-${record.id}`}</td>
                    <td>{`Lat: ${record.latitude.toFixed(3)}, Lon: ${record.longitude.toFixed(3)}`}</td>
                    <td>{record.distress_type}</td>
                    <td>
                      <span className={`distress-table__badge distress-table__badge--severity-${displaySeverity.toLowerCase()}`}>
                        {getSeverityIcon(displaySeverity)}
                        {displaySeverity}
                      </span>
                    </td>
                    <td className="distress-table__confidence">{Math.round(record.confidence_score * 100)}%</td>
                    <td>{dateStr === '2026-06-21' ? 'Today' : dateStr}</td>
                    <td>
                      <span className={`distress-table__badge distress-table__badge--status-${displayStatus.toLowerCase()}`}>
                        {displayStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="distress-table__empty-state">
                  No matching detections found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
