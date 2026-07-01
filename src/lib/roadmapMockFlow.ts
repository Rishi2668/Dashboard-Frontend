const WEEK_KEY = 'roadmap_mock_week';
const TASK_KEY = 'roadmap_mock_task';

export function setRoadmapMockIntent(weekNumber: number, taskKey: 'mandatory_mock' | 'optional_mock') {
  sessionStorage.setItem(WEEK_KEY, String(weekNumber));
  sessionStorage.setItem(TASK_KEY, taskKey);
}

export function peekRoadmapMockIntent(): { week: number; taskKey: string } | null {
  const week = sessionStorage.getItem(WEEK_KEY);
  const taskKey = sessionStorage.getItem(TASK_KEY);
  if (!week || !taskKey) return null;
  return { week: parseInt(week, 10), taskKey };
}

export function clearRoadmapMockIntent() {
  sessionStorage.removeItem(WEEK_KEY);
  sessionStorage.removeItem(TASK_KEY);
}

export function consumeRoadmapMockIntent(): { week: number; taskKey: string } | null {
  const intent = peekRoadmapMockIntent();
  if (intent) clearRoadmapMockIntent();
  return intent;
}
