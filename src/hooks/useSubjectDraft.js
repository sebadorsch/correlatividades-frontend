import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'src/contexts/GeneralContext.js';
import { postUsersSubjects } from 'src/services/submitUsersSubjects.js';
import {
  approvedElectiveHours, buildStatus, electiveChanges, electiveListFromUser, newElectiveId,
} from 'src/services/planStatus.ts';

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
  const [electiveList, setElectiveList] = useState(() => electiveListFromUser(user));
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  useEffect(() => {
    setDraft(draftFromUser(user));
    setElectiveList(electiveListFromUser(user));
  }, [user]);

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

  // Horas aprobadas por nivel: las usan el mapa y el avance de cada título.
  const electives = useMemo(() => approvedElectiveHours(electiveList), [electiveList]);

  const saved = draftFromUser(user);
  const changes = sorted.filter((s) => (draft[s.code] || 'pendiente') !== (saved[s.code] || 'pendiente')).length
    + electiveChanges(electiveListFromUser(user), electiveList);

  const setSubjectState = (code, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === 'pendiente') delete next[code];
      else next[code] = value;
      return next;
    });
    setSaveState('idle');
  };

  const addElective = ({ name, level, hours, state }) => {
    setElectiveList((prev) => [...prev, { id: newElectiveId(), name: name.trim(), level, hours, state }]);
    setSaveState('idle');
  };

  const updateElective = (id, patch) => {
    setElectiveList((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setSaveState('idle');
  };

  const removeElective = (id) => {
    setElectiveList((prev) => prev.filter((e) => e.id !== id));
    setSaveState('idle');
  };

  const save = async () => {
    const body = { ...listsFromDraft(draft), electives: electiveList };
    setSaveState('saving');
    try {
      const data = await postUsersSubjects(body);
      setCurrentUser({ ...user, ...body, ...(data || {}) });
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
    setElectiveList(electiveListFromUser(user));
    setSaveState('idle');
  };

  return {
    user, sorted, byCode, draft, electives, electiveList, statusByCode, lists, changes, saveState,
    setSubjectState, addElective, updateElective, removeElective, save, discard,
  };
}
