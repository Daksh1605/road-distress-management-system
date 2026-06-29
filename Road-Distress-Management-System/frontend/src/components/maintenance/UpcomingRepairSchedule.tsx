import { CalendarClock, MapPin, Users } from 'lucide-react';
import type { UpcomingRepair } from '../../types/maintenance';
import './UpcomingRepairSchedule.css';

interface UpcomingRepairScheduleProps {
  repairs: UpcomingRepair[];
}

export default function UpcomingRepairSchedule({ repairs }: UpcomingRepairScheduleProps) {
  const sortedRepairs = [...repairs].sort(
    (a, b) => new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime() -
      new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime()
  );

  return (
    <section className="mnt-schedule" aria-labelledby="mnt-schedule-title">
      <header className="mnt-schedule__header">
        <div className="mnt-schedule__header-group">
          <CalendarClock size={16} className="mnt-schedule__header-icon" />
          <h2 id="mnt-schedule-title" className="mnt-schedule__title">Upcoming Repair Schedule</h2>
        </div>
        <span className="mnt-schedule__badge font-mono">{repairs.length} scheduled</span>
      </header>

      <div className="mnt-schedule__body">
        <ul className="mnt-schedule__list">
          {sortedRepairs.map((repair, index) => (
            <li key={repair.id} className="mnt-schedule__item">
              <div className="mnt-schedule__timeline">
                <span className="mnt-schedule__dot" />
                {index < sortedRepairs.length - 1 && <span className="mnt-schedule__line" />}
              </div>

              <div className="mnt-schedule__content">
                <div className="mnt-schedule__content-header">
                  <time className="mnt-schedule__datetime font-mono">
                    {repair.scheduledDate} · {repair.scheduledTime}
                  </time>
                  <span className={`mnt-schedule__priority mnt-schedule__priority--${repair.priority.toLowerCase()}`}>
                    {repair.priority}
                  </span>
                </div>

                <div className="mnt-schedule__road">
                  <span className="font-mono mnt-schedule__road-id">{repair.roadId}</span>
                  <span className="mnt-schedule__distress">{repair.distressType}</span>
                </div>

                <p className="mnt-schedule__location">
                  <MapPin size={12} />
                  {repair.location}
                </p>

                <div className="mnt-schedule__team">
                  <Users size={12} />
                  {repair.team}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
