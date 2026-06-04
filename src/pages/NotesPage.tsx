import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookMarked, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { notesApi } from '@/api';
import { apiError } from '@/lib/apiError';
import type { Note } from '@/types';
import toast from 'react-hot-toast';

const NOTE_TYPES = ['general', 'formula', 'vocabulary', 'gk', 'mistake'];

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [mistakeOnly, setMistakeOnly] = useState(false);
  const [editing, setEditing] = useState<Partial<Note> | null>(null);

  const load = () => {
    notesApi
      .list({
        search: search || undefined,
        note_type: filter || undefined,
        is_mistake: mistakeOnly ? true : undefined,
      })
      .then((r) => setNotes(r.data))
      .catch((err) => {
        toast.error(apiError(err, 'Could not load notes'));
        setNotes([]);
      });
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, filter, mistakeOnly]);

  const notePayload = (n: Partial<Note>) => ({
    title: (n.title ?? '').trim(),
    content: n.content ?? '',
    note_type: n.note_type ?? 'general',
    tags: n.tags ?? null,
    is_mistake: n.is_mistake ?? false,
    subject: n.subject ?? null,
  });

  const save = async () => {
    const title = editing?.title?.trim();
    if (!title) {
      toast.error('Title is required');
      return;
    }
    try {
      if (editing?.id) {
        await notesApi.update(editing.id, notePayload(editing));
      } else {
        await notesApi.create(notePayload(editing!));
      }
      toast.success(editing?.is_mistake ? 'Mistake journal entry saved' : 'Note saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(apiError(err, 'Failed to save note'));
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.delete(id);
      toast.success('Deleted');
      if (editing?.id === id) setEditing(null);
      load();
    } catch (err) {
      toast.error(apiError(err, 'Could not delete'));
    }
  };

  return (
    <motion.div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookMarked className="text-blue-400" />
          Notes & Mistake Journal
        </h1>
        <button
          onClick={() => setEditing({ title: '', content: '', note_type: 'general', is_mistake: false })}
          className="flex items-center gap-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
        >
          <option value="" className="bg-gray-900">All types</option>
          {NOTE_TYPES.map((t) => (
            <option key={t} value={t} className="bg-gray-900">
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 px-3">
          <input type="checkbox" checked={mistakeOnly} onChange={(e) => setMistakeOnly(e.target.checked)} />
          Mistakes only
        </label>
      </div>

      {editing && (
        <GlassCard>
          <input
            value={editing.title ?? ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Title"
            className="w-full mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
          <textarea
            value={editing.content ?? ''}
            onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            placeholder="Write your notes, formulas, vocabulary..."
            rows={6}
            className="w-full mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-y"
          />
          <motion.div className="flex gap-2 flex-wrap mb-3">
            <select
              value={editing.note_type ?? 'general'}
              onChange={(e) => setEditing({ ...editing, note_type: e.target.value })}
              className="px-3 py-1 bg-white/5 rounded-lg text-white text-sm"
            >
              {NOTE_TYPES.map((t) => (
                <option key={t} value={t} className="bg-gray-900">
                  {t}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-sm text-red-400">
              <input
                type="checkbox"
                checked={editing.is_mistake ?? false}
                onChange={(e) => setEditing({ ...editing, is_mistake: e.target.checked })}
              />
              Mistake journal
            </label>
          </motion.div>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
              Save
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-slate-400 text-sm">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-3">
        {notes.length === 0 && !editing && (
          <p className="text-center text-slate-500 text-sm py-12">
            No notes yet. Add formulas, vocabulary, or mistake journal entries.
          </p>
        )}
        {notes.map((n) => (
          <GlassCard key={n.id} hover className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditing(n)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  {n.is_mistake && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      Mistake
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{n.note_type}</p>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{n.content}</p>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void remove(n.id);
                }}
                className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 shrink-0"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
