import { Search } from 'lucide-react';
import { SUBJECTS } from '@/lib/utils';

export interface RevisionFilterState {
  status: string;
  subject: string;
  priority: string;
  difficulty: string;
  search: string;
}

interface RevisionFiltersProps {
  filters: RevisionFilterState;
  onChange: (f: RevisionFilterState) => void;
}

const selectClass =
  'px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm min-w-[120px]';

export function RevisionFilters({ filters, onChange }: RevisionFiltersProps) {
  const set = (patch: Partial<RevisionFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search topic, subject, notes…"
          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) => set({ status: e.target.value })}
          className={selectClass}
        >
          <option value="" className="bg-gray-900">
            All statuses
          </option>
          <option value="pending" className="bg-gray-900">
            Pending
          </option>
          <option value="upcoming" className="bg-gray-900">
            Upcoming
          </option>
          <option value="overdue" className="bg-gray-900">
            Overdue
          </option>
          <option value="completed" className="bg-gray-900">
            Completed
          </option>
        </select>
        <select
          value={filters.subject}
          onChange={(e) => set({ subject: e.target.value })}
          className={selectClass}
        >
          <option value="" className="bg-gray-900">
            All subjects
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s} className="bg-gray-900">
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => set({ priority: e.target.value })}
          className={selectClass}
        >
          <option value="" className="bg-gray-900">
            All priorities
          </option>
          <option value="high" className="bg-gray-900">
            High
          </option>
          <option value="medium" className="bg-gray-900">
            Medium
          </option>
          <option value="low" className="bg-gray-900">
            Low
          </option>
        </select>
        <select
          value={filters.difficulty}
          onChange={(e) => set({ difficulty: e.target.value })}
          className={selectClass}
        >
          <option value="" className="bg-gray-900">
            All difficulty
          </option>
          <option value="easy" className="bg-gray-900">
            Easy
          </option>
          <option value="medium" className="bg-gray-900">
            Medium
          </option>
          <option value="hard" className="bg-gray-900">
            Hard
          </option>
        </select>
      </div>
    </div>
  );
}
