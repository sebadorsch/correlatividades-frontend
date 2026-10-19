import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'src/contexts/GeneralContext.js';
import { postUsersSubjects } from 'src/services/submitUsersSubjects.js';
import { buildStatus, electivesFromUser, ELECTIVE_LEVELS } from 'src/services/planStatus.ts';

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
  const [electives, setElectives] = useState(() => electivesFromUser(user));
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  useEffect(() => {
    setDraft(draftFromUser(user));
    setElectives(electivesFromUser(user));
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

  const saved = draftFromUser(user);
  const savedElectives = electivesFromUser(user);
  const changes = sorted.filter((s) => (draft[s.code] || 'pendiente') !== (saved[s.code] || 'pendiente')).length
    + ELECTIVE_LEVELS.filter((level) => electives[level] !== savedElectives[level]).length;

  const setSubjectState = (code, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === 'pendiente') delete next[code];
      else next[code] = value;
      return next;
    });
    setSaveState('idle');
  };

  // hours puede ser un número o una función del valor anterior (para los botones − y +).
  const setElectiveHours = (level, hours) => {
    setElectives((prev) => {
      const next = typeof hours === 'function' ? hours(prev[level]) : hours;
      return { ...prev, [level]: Math.max(0, Math.min(60, next)) };
    });
    setSaveState('idle');
  };

  const save = async () => {
    const body = {
      ...listsFromDraft(draft),
      electiveHoursLevel3: electives[3],
      electiveHoursLevel4: electives[4],
      electiveHoursLevel5: electives[5],
    };
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
    setElectives(electivesFromUser(user));
    setSaveState('idle');
  };

  return {
    user, sorted, byCode, draft, electives, statusByCode, lists, changes, saveState,
    setSubjectState, setElectiveHours, save, discard,
  };
}
