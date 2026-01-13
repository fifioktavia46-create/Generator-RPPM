
import { EducationLevel, GraduateDimension, PedagogicalPractice } from './types';

export const EDUCATION_LEVELS = [EducationLevel.SD, EducationLevel.SMP, EducationLevel.SMA];

export const GRADE_OPTIONS: Record<EducationLevel, string[]> = {
  [EducationLevel.SD]: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  [EducationLevel.SMP]: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  [EducationLevel.SMA]: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
};

export const PEDAGOGICAL_PRACTICES = [
  PedagogicalPractice.Inquiry,
  PedagogicalPractice.PjBL,
  PedagogicalPractice.ProblemSolving,
  PedagogicalPractice.GameBased,
  PedagogicalPractice.StationLearning,
];

export const GRADUATE_DIMENSIONS: GraduateDimension[] = [
  'Keimanan & Ketakwaan',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
];
