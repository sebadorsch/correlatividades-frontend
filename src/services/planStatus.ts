// Reglas del Plan 2023 (UTN San Nicolás): para cursar una materia hay que tener
// regularizadas las de "Cursada" (requiredSubjectsToEnroll) y aprobadas las de
// "Aprobada" (requiredSubjectsToPass). Una materia aprobada cuenta como regular.

export type SubjectState = 'aprobada' | 'regular' | 'disponible' | 'bloqueada';

export type Subject = {
  id: number;
  code: number;
  name: string;
  termType?: 'ANUAL' | 'CUATRIMESTRAL' | null;
  weeklyHours?: number | null;
  courseYear?: number | null;
  requiredSubjectsToEnroll: number[];
  requiredSubjectsToPass: number[];
};

export type SubjectStatus = {
  state: SubjectState;
  missingRegular: number[];
  missingApproved: number[];
};

export const buildStatus = (
  subjects: Subject[],
  regularized: number[],
  approved: number[],
): Map<number, SubjectStatus> => {
  const approvedSet = new Set(approved);
  const regularSet = new Set([...regularized, ...approved]);

  return new Map(subjects.map((subject) => {
    const missingRegular = subject.requiredSubjectsToEnroll.filter((code) => !regularSet.has(code));
    const missingApproved = subject.requiredSubjectsToPass.filter((code) => !approvedSet.has(code));

    let state: SubjectState;
    if (approvedSet.has(subject.code)) state = 'aprobada';
    else if (regularSet.has(subject.code)) state = 'regular';
    else if (missingRegular.length === 0 && missingApproved.length === 0) state = 'disponible';
    else state = 'bloqueada';

    return [subject.code, { state, missingRegular, missingApproved }];
  }));
};

// La materia que, aprobada, habilita más materias que hoy están bloqueadas.
export const findTopUnlock = (subjects: Subject[], regularized: number[], approved: number[]) => {
  const current = buildStatus(subjects, regularized, approved);
  let best: { subject: Subject; unlocks: Subject[] } | null = null;

  for (const subject of subjects) {
    if (current.get(subject.code)?.state === 'aprobada') continue;

    const next = buildStatus(subjects, regularized, [...approved, subject.code]);
    const unlocks = subjects.filter((other) =>
      other.code !== subject.code
      && current.get(other.code)?.state === 'bloqueada'
      && next.get(other.code)?.state === 'disponible');

    if (unlocks.length > (best?.unlocks.length ?? 0)) best = { subject, unlocks };
  }

  return best;
};

export const formatTermType = (termType?: string | null) =>
  termType === 'CUATRIMESTRAL' ? 'Cuatrimestral' : termType === 'ANUAL' ? 'Anual' : '—';

export const levelName = (level: number) => `${level}º nivel`;
