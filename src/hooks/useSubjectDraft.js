import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'src/contexts/GeneralContext.js';
import { postUsersSubjects } from 'src/services/submitUsersSubjects.js';
import { buildStatus } from 'src/services/planStatus.ts';

// Estado que marca el alumno por materia: 'pendiente' | 'regular' | 'aprobada'
export const draftFromUser = (user) => {
  const draft = {};
  (user?.regularizedSubjects || []).forEach((code) => { draft[code] = 'regular'; });
  (user?.approvedSubjects || []).forEach((code) => { draft[code] = 'aprobada'; });
  return draft;
};

export const listsFromDraft = (draft) => {
  const entries = Object.entries(draft);
  const codes = (pick) => entries.filter(([, s]) => pick(s)).map(([c]) => Number(c)).sort((a, b) => a - b);
  return {
    regularizedSubjects: codes((s) => s === 'regular' || s === 'aprobada'),
    approvedSubjects: codes((s) => s === 'aprobada'),
  };
};

export default function useSubjectDraft() {
  const { subjects, currentUser: user, setCurrentUser } = useAuth();
  const [draft, setDraft] = useState(() => draftFromUser(user));
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  useEffect(() => { setDraft(draftFromUser(user)); }, [user]);

  useEffect(() => {
    if (saveState !== 'saved') return undefined;
    const timer = setTimeout(() => setSaveState('idle'), 3000);
    return () => clearTimeout(timer);
  }, [saveState]);

  const sorted = useMemo(() => [...(subjects || [])].sort((a, b) => a.code - b.code), [subjects]);
  const byCode = useMemo(() => new Map(sorted.map((s) => [s.code, s])), [sorted]);

  const lists = listsFromDraft(draft);
  const statusByCode = useMemo(
    () => buildStatus(sorted, lists.regularizedSubjects, lists.approvedSubjects),
    [sorted, lists.regularizedSubjects.join(), lists.approvedSubjects.join()],
  );

  const saved = draftFromUser(user);
  const changes = sorted.filter((s) => (draft[s.code] || 'pendiente') !== (saved[s.code] || 'pendiente')).length;

  const setSubjectState = (code, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === 'pendiente') delete next[code];
      else next[code] = value;
      return next;
    });
    setSaveState('idle');
  };

  const save = async (override) => {
    const target = override ?? draft;
    const body = listsFromDraft(target);
    setSaveState('saving');
    try {
      const data = await postUsersSubjects(body);
      setCurrentUser({
        ...user,
        regularizedSubjects: data?.regularizedSubjects ?? body.regularizedSubjects,
        approvedSubjects: data?.approvedSubjects ?? body.approvedSubjects,
      });
      setSaveState('saved');
      return true;
    } catch (error) {
      console.error('Ocurrió un error al guardar las materias', error);
      setSaveState('error');
      return false;
    }
  };

  const discard = () => {
    setDraft(draftFromUser(user));
    setSaveState('idle');
  };

  return {
    user, sorted, byCode, draft, statusByCode, lists, changes, saveState,
    setSubjectState, save, discard,
  };
}
