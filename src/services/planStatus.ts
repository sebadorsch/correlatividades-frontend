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

// Número de orden como figura en el plan (Ord. 1878): 01, 09, 24… El Seminario Integrador del
// Analista no tiene número propio en el plan de Ingeniería; se muestra como 23A, igual que en las regionales.
export const orderLabel = (subject?: Pick<Subject, 'code' | 'intermediateTitleOnly'> | null) => {
  if (!subject) return '';
  return subject.intermediateTitleOnly ? '23A' : String(subject.code).padStart(2, '0');
};

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

// Electiva que carga el alumno. Solo las aprobadas suman horas para el título.
export type ElectiveState = 'regular' | 'aprobada';
export type Elective = { id: string; name: string; level: 3 | 4 | 5; hours: number; state: ElectiveState };

export const newElectiveId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);

// Lista de electivas del usuario. Si todavía no tiene lista (API vieja), arma una por nivel con las horas sueltas.
export const electiveListFromUser = (user: any): Elective[] => {
  if (Array.isArray(user?.electives)) return user.electives;
  return ELECTIVE_LEVELS
    .map((level) => ({ level, hours: user?.[`electiveHoursLevel${level}`] ?? 0 }))
    .filter(({ hours }) => hours > 0)
    .map(({ level, hours }) => ({
      id: `migrada-${level}`, name: 'Electivas sin detallar', level, hours, state: 'aprobada' as const,
    }));
};

// Horas aprobadas por nivel.
export const approvedElectiveHours = (list: Elective[]): ElectiveHours => {
  const sum = (level: number) => list
    .filter((e) => e.level === level && e.state === 'aprobada')
    .reduce((total, e) => total + e.hours, 0);
  return { 3: sum(3), 4: sum(4), 5: sum(5) };
};

// Cuántas electivas cambiaron (agregadas, borradas o modificadas) entre dos listas.
export const electiveChanges = (saved: Elective[], current: Elective[]) => {
  const key = (e: Elective) => `${e.name}|${e.level}|${e.hours}|${e.state}`;
  const before = new Map(saved.map((e) => [e.id, key(e)]));
  const after = new Map(current.map((e) => [e.id, key(e)]));
  let changes = 0;
  after.forEach((k, id) => { if (before.get(id) !== k) changes += 1; });
  before.forEach((_, id) => { if (!after.has(id)) changes += 1; });
  return changes;
};

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
