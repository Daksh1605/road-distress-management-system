import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../types/maintenance';
import './WorkOrdersTable.css';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

const STATUS_OPTIONS: WorkOrderStatus[] = ['Pending', 'Assigned', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS: WorkOrderPriority[] = ['Critical', 'High', 'Medium', 'Low'];

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  const filteredOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        order.orderId.toLowerCase().includes(query) ||
        order.roadId.toLowerCase().includes(query) ||
        order.location.toLowerCase().includes(query) ||
        order.assignedTeam.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || order.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [workOrders, searchQuery, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const getStatusIcon = (status: WorkOrderStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={13} className="mnt-wo__icon-green" />;
      case 'In Progress':
        return <Wrench size={13} className="mnt-wo__icon-amber" />;
      case 'Assigned':
        return <UserCheck size={13} className="mnt-wo__icon-blue" />;
      case 'Pending':
      default:
        return <Clock size={13} className="mnt-wo__icon-purple" />;
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCurrentPage(1);
  };

  return (
    <section className="mnt-wo" aria-labelledby="mnt-wo-title">
      <header className="mnt-wo__header">
        <div className="mnt-wo__header-group">
          <ClipboardList size={16} className="mnt-wo__header-icon" />
          <h2 id="mnt-wo-title" className="mnt-wo__title">Work Orders</h2>
        </div>
        <span className="mnt-wo__badge font-mono">
          {filteredOrders.length} orders
        </span>
      </header>

      <div className="mnt-wo__controls">
        <div className="mnt-wo__search-wrapper">
          <Search size={14} className="mnt-wo__search-icon" />
          <input
            type="text"
            className="mnt-wo__search-input"
            placeholder="Search orders, roads, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search work orders"
          />
        </div>
        <div className="mnt-wo__filters">
          <div className="mnt-wo__select-box">
            <Filter size={13} className="mnt-wo__select-icon" />
            <select
              className="mnt-wo__select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <select
            className="mnt-wo__select mnt-wo__select--plain"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button type="button" className="mnt-wo__reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="mnt-wo__body">
        <div className="mnt-wo__table-wrapper">
          <table className="mnt-wo__table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Road ID</th>
                <th>Location</th>
                <th>Distress Type</th>
                <th>Priority</th>
                <th>Assigned Team</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="mnt-wo__empty">
                    No work orders match your filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="font-mono mnt-wo__id">{order.orderId}</td>
                    <td className="font-mono">{order.roadId}</td>
                    <td className="mnt-wo__location">{order.location}</td>
                    <td>{order.distressType}</td>
                    <td>
                      <span className={`mnt-wo__priority mnt-wo__priority--${order.priority.toLowerCase()}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="mnt-wo__team">{order.assignedTeam}</td>
                    <td>
                      <span className={`mnt-wo__status mnt-wo__status--${order.status.replace(/\s/g, '-').toLowerCase()}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="font-mono mnt-wo__date">{order.dueDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mnt-wo__footer">
        <span className="mnt-wo__page-info">
          Page {currentPage} of {totalPages}
        </span>
        <div className="mnt-wo__pagination">
          <button
            type="button"
            className="mnt-wo__page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="mnt-wo__page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </section>
  );
}
