import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookMarked } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { notesApi } from '@/api';
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
        is_mistake: mistakeOnly || undefined,
      })
      .then((r) => setNotes(r.data));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, filter, mistakeOnly]);

  const save = async () => {
    if (!editing?.title) return;
    try {
      if (editing.id) {
        await notesApi.update(editing.id, editing);
      } else {
        await notesApi.create(editing);
      }
      toast.success('Note saved');
      setEditing(null);
      load();
    } catch {
      toast.error('Failed to save');
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
        {notes.map((n) => (
          <GlassCard key={n.id} hover onClick={() => setEditing(n)} className="!p-4 cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  {n.is_mistake && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Mistake</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{n.note_type}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{n.content}</p>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
