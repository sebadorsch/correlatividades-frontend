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
  intermediateTitleOnly?: boolean;
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

export const STATE_LABEL: Record<SubjectState, string> = {
  aprobada: 'Aprobada',
  regular: 'Regular',
  disponible: 'Podés cursar',
  bloqueada: 'Bloqueada',
};

export const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;

// Horas semanales de electivas que exige el plan en cada nivel (Ord. 1877).
export const ELECTIVE_LEVELS = [3, 4, 5] as const;
export type ElectiveHours = Record<3 | 4 | 5, number>;
export const ELECTIVE_REQUIRED: ElectiveHours = { 3: 4, 4: 6, 5: 10 };

export const electivesFromUser = (user: any): ElectiveHours => ({
  3: user?.electiveHoursLevel3 ?? 0,
  4: user?.electiveHoursLevel4 ?? 0,
  5: user?.electiveHoursLevel5 ?? 0,
});

// Materias de la carrera de grado (sin las que solo pide el título de Analista).
export const degreeSubjects = (subjects: Subject[]) => subjects.filter((s) => !s.intermediateTitleOnly);

type TitleProgress = {
  approved: number;
  total: number;
  electivesDone: number;
  electivesRequired: number;
  complete: boolean;
};

const titleProgress = (
  subjects: Subject[],
  statusByCode: Map<number, SubjectStatus>,
  electives: ElectiveHours,
  levels: (3 | 4 | 5)[],
): TitleProgress => {
  const approved = subjects.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length;
  const electivesDone = levels.reduce((sum, level) => sum + Math.min(electives[level], ELECTIVE_REQUIRED[level]), 0);
  const electivesRequired = levels.reduce((sum, level) => sum + ELECTIVE_REQUIRED[level], 0);
  return {
    approved,
    total: subjects.length,
    electivesDone,
    electivesRequired,
    complete: approved === subjects.length && electivesDone === electivesRequired,
  };
};

// Analista: materias de 1º a 3º nivel + Seminario Integrador + electivas de 3º nivel (Ord. 1910).
export const analistaProgress = (subjects: Subject[], statusByCode: Map<number, SubjectStatus>, electives: ElectiveHours) =>
  titleProgress(subjects.filter((s) => (s.courseYear ?? 0) <= 3), statusByCode, electives, [3]);

// Ingeniería: las 36 materias + electivas de 3º, 4º y 5º nivel (la PPS no se registra en la app).
export const ingenieriaProgress = (subjects: Subject[], statusByCode: Map<number, SubjectStatus>, electives: ElectiveHours) =>
  titleProgress(degreeSubjects(subjects), statusByCode, electives, [3, 4, 5]);
