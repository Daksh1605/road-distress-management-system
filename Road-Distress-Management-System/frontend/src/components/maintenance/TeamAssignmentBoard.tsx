import { Users, MapPin, Truck, Circle } from 'lucide-react';
import type { MaintenanceTeam } from '../../types/maintenance';
import './TeamAssignmentBoard.css';

interface TeamAssignmentBoardProps {
  teams: MaintenanceTeam[];
}

const STATUS_LABELS: Record<MaintenanceTeam['status'], string> = {
  Available: 'Available',
  'On Site': 'On Site',
  'En Route': 'En Route',
  'Off Duty': 'Off Duty',
};

export default function TeamAssignmentBoard({ teams }: TeamAssignmentBoardProps) {
  return (
    <section className="mnt-team" aria-labelledby="mnt-team-title">
      <header className="mnt-team__header">
        <div className="mnt-team__header-group">
          <Users size={16} className="mnt-team__header-icon" />
          <h2 id="mnt-team-title" className="mnt-team__title">Team Assignment Board</h2>
        </div>
        <span className="mnt-team__badge font-mono">{teams.length} teams</span>
      </header>

      <div className="mnt-team__body">
        <div className="mnt-team__grid">
          {teams.map((team) => {
            const utilization = Math.round((team.activeOrders / team.capacity) * 100);
            const isOverloaded = team.activeOrders >= team.capacity;

            return (
              <article key={team.id} className="mnt-team__card">
                <div className="mnt-team__card-header">
                  <div>
                    <h3 className="mnt-team__card-name">{team.name}</h3>
                    <span className="mnt-team__card-leader">Lead: {team.leader}</span>
                  </div>
                  <span className={`mnt-team__status mnt-team__status--${team.status.replace(/\s/g, '-').toLowerCase()}`}>
                    <Circle size={8} className="mnt-team__status-dot" />
                    {STATUS_LABELS[team.status]}
                  </span>
                </div>

                <p className="mnt-team__specialization">{team.specialization}</p>

                <div className="mnt-team__meta">
                  <span className="mnt-team__meta-item">
                    <Users size={13} />
                    {team.members} members
                  </span>
                  <span className="mnt-team__meta-item">
                    <Truck size={13} />
                    {team.activeOrders}/{team.capacity} orders
                  </span>
                </div>

                <div className="mnt-team__utilization">
                  <div className="mnt-team__util-header">
                    <span>Capacity</span>
                    <span className="font-mono">{utilization}%</span>
                  </div>
                  <div className="mnt-team__util-track">
                    <div
                      className={`mnt-team__util-fill ${isOverloaded ? 'mnt-team__util-fill--warn' : ''}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>

                {team.currentAssignment && (
                  <div className="mnt-team__assignment">
                    <MapPin size={13} />
                    <span className="font-mono">{team.currentAssignment}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
