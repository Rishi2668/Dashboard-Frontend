import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';
import type { RoadmapTask } from '@/types/roadmap2026';
import { setRoadmapMockIntent } from '@/lib/roadmapMockFlow';
import { TopicCheckbox } from './TopicCheckbox';

interface MockTaskRowProps {
  weekNumber: number;
  task: RoadmapTask;
  onUpdate: (taskKey: string, data: Record<string, unknown>) => Promise<void>;
}

export function MockTaskRow({ weekNumber, task, onUpdate }: MockTaskRowProps) {
  const navigate = useNavigate();
  const taskKey = (task.key ?? task.task_key ?? '') as 'mandatory_mock' | 'optional_mock' | 'mock_analysis' | string;

  const toggle = () => onUpdate(taskKey, { completed: !task.completed });

  const sublabel =
    task.completed && task.score != null
      ? `Score ${task.score}${task.accuracy != null ? ` · ${task.accuracy}% acc` : ''}`
      : undefined;

  const goToAnalytics = (openForm: boolean) => {
    if (taskKey === 'mandatory_mock' || taskKey === 'optional_mock') {
      setRoadmapMockIntent(weekNumber, taskKey);
    }
    navigate(openForm ? '/analytics?add=1' : '/analytics');
  };

  const isMockEntry = taskKey === 'mandatory_mock' || taskKey === 'optional_mock';
  const isAnalysis = taskKey === 'mock_analysis';

  return (
    <div className="py-0.5">
      <TopicCheckbox
        label={task.label}
        completed={task.completed}
        onToggle={toggle}
        sublabel={sublabel}
      />
      {isMockEntry && !task.completed && (
        <button
          type="button"
          onClick={() => goToAnalytics(true)}
          className="roadmap-link-action ml-8 mt-0.5"
        >
          Log mock in Analytics
          <ArrowRight size={14} />
        </button>
      )}
      {isMockEntry && task.completed && (
        <button
          type="button"
          onClick={() => goToAnalytics(false)}
          className="roadmap-link-action ml-8 mt-0.5 text-slate-500"
        >
          <BarChart3 size={13} />
          View in Analytics
        </button>
      )}
      {isAnalysis && !task.completed && (
        <button
          type="button"
          onClick={() => goToAnalytics(false)}
          className="roadmap-link-action ml-8 mt-0.5"
        >
          Review mocks
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
