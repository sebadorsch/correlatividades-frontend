export const getSubjectsUserCanEnroll = (subjects: any, user: any) => {
  if (!user) return [];

  const regularized = new Set(user.regularizedSubjects);
  const approved = new Set(user.approvedSubjects);

  return subjects.filter((subject: { code: unknown; requiredSubjectsToEnroll: any[]; }) =>
    !approved.has(subject.code) && subject.requiredSubjectsToEnroll.every(code => regularized.has(code))
  );
};
