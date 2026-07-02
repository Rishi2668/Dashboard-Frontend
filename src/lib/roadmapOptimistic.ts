import type { Roadmap2026, RoadmapWeek } from '@/types/roadmap2026';

function recalcWeek(week: RoadmapWeek): RoadmapWeek {
  let done = 0;
  let total = 0;

  for (const sec of week.sections) {
    for (const t of sec.topics) {
      total += 1;
      if (t.completed) done += 1;
    }
  }
  for (const v of week.virtual_tasks) {
    total += 1;
    if (v.completed) done += 1;
  }
  for (const m of week.mock_tasks) {
    if (m.required !== false && m.key !== 'optional_mock') {
      total += 1;
      if (m.completed) done += 1;
    }
  }
  for (const habits of [week.daily_vocab, week.daily_gs, week.daily_qr]) {
    for (const d of habits ?? []) {
      total += 1;
      if (d.completed) done += 1;
    }
  }

  return {
    ...week,
    completed_count: done,
    total_count: total,
    completion_pct: total ? Math.round((done / total) * 1000) / 10 : 0,
  };
}

function recalcOverall(weeks: RoadmapWeek[]) {
  const overall_total = weeks.reduce((s, w) => s + w.total_count, 0);
  const overall_completed = weeks.reduce((s, w) => s + w.completed_count, 0);
  return {
    overall_total,
    overall_completed,
    overall_completion: overall_total
      ? Math.round((overall_completed / overall_total) * 1000) / 10
      : 0,
  };
}

function patchDailyStudyHub(data: Roadmap2026): Roadmap2026 {
  if (!data.daily_study_hub) return data;
  const currentWeek = data.weeks.find((w) => w.number === data.current_week);
  if (!currentWeek) return data;

  const subjects = data.daily_study_hub.subjects.map((sub) => {
    const habits =
      sub.habit_field === 'daily_gs'
        ? currentWeek.daily_gs
        : sub.habit_field === 'daily_qr'
          ? currentWeek.daily_qr
          : currentWeek.daily_vocab;
    const weekTopics = currentWeek.sections
      .filter((sec) => {
        if (sub.subject_key === 'GS') return sec.subject === 'GS';
        if (sub.subject_key === 'English') return sec.subject === 'English';
        return sec.subject === 'Quant' || sec.subject === 'Reasoning';
      })
      .flatMap((sec) => sec.topics);
    return {
      ...sub,
      habits: habits ?? sub.habits,
      habits_done: (habits ?? []).filter((h) => h.completed).length,
      week_topics: weekTopics,
      next_topic: weekTopics.find((t) => !t.completed)?.label ?? null,
    };
  });

  return {
    ...data,
    daily_study_hub: { ...data.daily_study_hub, subjects },
  };
}

export function patchChapterCompleted(
  data: Roadmap2026,
  chapterId: number,
  completed: boolean
): Roadmap2026 {
  const weeks = data.weeks.map((week) => {
    const sections = week.sections.map((sec) => ({
      ...sec,
      topics: sec.topics.map((t) =>
        t.chapter_id === chapterId
          ? { ...t, completed, progress_percentage: completed ? 100 : 0 }
          : t
      ),
    }));
    return recalcWeek({ ...week, sections });
  });

  const overall = recalcOverall(weeks);
  let next = { ...data, weeks, ...overall };
  next = patchDailyStudyHub(next);

  if (next.english_roadmap) {
    const phases = next.english_roadmap.phases.map((phase) => {
      const topics = phase.topics.map((topic) => {
        if (topic.virtual || !topic.chapter_id) return topic;
        if (topic.chapter_id === chapterId) {
          return { ...topic, completed };
        }
        return topic;
      });
      const done = topics.filter((t) => t.completed).length;
      return {
        ...phase,
        topics,
        completed_count: done,
        completion_pct: topics.length ? Math.round((done / topics.length) * 1000) / 10 : 0,
      };
    });
    next = {
      ...next,
      english_roadmap: {
        ...next.english_roadmap,
        phases,
        current_week_english_topics: weeks
          .find((w) => w.number === data.current_week)
          ?.sections.filter((s) => s.subject === 'English')
          .flatMap((s) => s.topics) ?? [],
      },
    };
  }

  return next;
}

export function patchDailyHabit(
  data: Roadmap2026,
  weekNumber: number,
  taskKey: string,
  completed: boolean
): Roadmap2026 {
  const patchHabits = (habits: { key: string; label: string; completed: boolean }[]) =>
    habits.map((d) => (d.key === taskKey ? { ...d, completed } : d));

  const weeks = data.weeks.map((week) => {
    if (week.number !== weekNumber) return week;
    const updated = {
      ...week,
      daily_vocab: patchHabits(week.daily_vocab ?? []),
      daily_gs: patchHabits(week.daily_gs ?? []),
      daily_qr: patchHabits(week.daily_qr ?? []),
    };
    return recalcWeek(updated);
  });

  const overall = recalcOverall(weeks);
  let next = { ...data, weeks, ...overall };
  next = patchDailyStudyHub(next);

  if (taskKey.startsWith('daily_vocab') && next.english_roadmap) {
    const cw = weeks.find((w) => w.number === data.current_week);
    next = {
      ...next,
      english_roadmap: {
        ...next.english_roadmap,
        current_week_vocab: cw?.daily_vocab ?? [],
      },
    };
  }

  return next;
}

export function patchVirtualTask(
  data: Roadmap2026,
  weekNumber: number,
  taskKey: string,
  completed: boolean
): Roadmap2026 {
  const weeks = data.weeks.map((week) => {
    if (week.number !== weekNumber) return week;
    const virtual_tasks = week.virtual_tasks.map((t) =>
      t.task_key === taskKey ? { ...t, completed } : t
    );
    const mock_tasks = week.mock_tasks.map((t) =>
      (t.key === taskKey || t.task_key === taskKey) ? { ...t, completed } : t
    );
    return recalcWeek({ ...week, virtual_tasks, mock_tasks });
  });

  const overall = recalcOverall(weeks);
  return { ...data, weeks, ...overall };
}
