import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import './RecentDetectionsTable.css'

export type SeverityType = 'High' | 'Medium' | 'Low'
export type StatusType = 'Pending' | 'Verified' | 'Assigned' | 'Completed'

export interface DistressRecord {
  roadId: string
  location: string
  distressType: string
  severity: SeverityType
  confidence: number
  date: string
  status: StatusType
}

const SAMPLE_DATA: DistressRecord[] = [
  {
    roadId: 'RD-1023',
    location: 'Patiala',
    distressType: 'Pothole',
    severity: 'High',
    confidence: 97,
    date: 'Today',
    status: 'Pending',
  },
  {
    roadId: 'RD-1041',
    location: 'Chandigarh',
    distressType: 'Crack',
    severity: 'Medium',
    confidence: 92,
    date: 'Today',
    status: 'Verified',
  },
  {
    roadId: 'RD-1087',
    location: 'Ambala',
    distressType: 'Rutting',
    severity: 'High',
    confidence: 95,
    date: 'Yesterday',
    status: 'Assigned',
  },
  {
    roadId: 'RD-1104',
    location: 'Mohali',
    distressType: 'Edge Break',
    severity: 'Low',
    confidence: 88,
    date: 'Yesterday',
    status: 'Completed',
  },
]

export default function RecentDetectionsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const filteredData = useMemo(() => {
    return SAMPLE_DATA.filter((record) => {
      const matchesSearch =
        record.roadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.distressType.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSeverity =
        selectedSeverity === 'All' || record.severity === selectedSeverity

      const matchesStatus =
        selectedStatus === 'All' || record.status === selectedStatus

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [searchTerm, selectedSeverity, selectedStatus])

  const getSeverityIcon = (severity: SeverityType) => {
    switch (severity) {
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
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Wrapper (makes it responsive & scrollable) */}
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
              filteredData.map((record) => (
                <tr key={record.roadId}>
                  <td className="distress-table__road-id">{record.roadId}</td>
                  <td>{record.location}</td>
                  <td>{record.distressType}</td>
                  <td>
                    <span className={`distress-table__badge distress-table__badge--severity-${record.severity.toLowerCase()}`}>
                      {getSeverityIcon(record.severity)}
                      {record.severity}
                    </span>
                  </td>
                  <td className="distress-table__confidence">{record.confidence}%</td>
                  <td>{record.date}</td>
                  <td>
                    <span className={`distress-table__badge distress-table__badge--status-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
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
