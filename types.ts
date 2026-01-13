
export enum EducationLevel {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA'
}

export enum PedagogicalPractice {
  Inquiry = 'Inkuiri-Discovery',
  PjBL = 'PjBL',
  ProblemSolving = 'Problem Solving',
  GameBased = 'Game Based Learning',
  StationLearning = 'Station Learning'
}

export type GraduateDimension = 
  | 'Keimanan & Ketakwaan'
  | 'Kewargaan'
  | 'Penalaran Kritis'
  | 'Kreativitas'
  | 'Kolaborasi'
  | 'Kemandirian'
  | 'Kesehatan'
  | 'Komunikasi';

export interface RpmInputData {
  schoolName: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  level: EducationLevel;
  grade: string;
  subject: string;
  learningOutcomes: string;
  learningObjectives: string;
  material: string;
  sessionsCount: number;
  durationPerSession: string;
  sessionPractices: Record<number, PedagogicalPractice>;
  dimensions: GraduateDimension[];
}

export interface SessionPlan {
  sessionNumber: number;
  pedagogicalPractice: string;
  tag: string; // berkesadaran, bermakna, menggembirakan
  memahami: string;
  mengaplikasi: string;
  refleksi: string;
}

export interface GeneratedRpmData {
  identitas: {
    schoolName: string;
    subject: string;
    gradeSemester: string;
    duration: string;
  };
  identifikasi: {
    siswa: string;
    materi: string;
    dimensi: string;
  };
  desain: {
    cp: string;
    lintasDisiplin: string;
    tp: string;
    topik: string;
    pedagogis: string;
    kemitraan: string;
    lingkungan: string;
    digital: string;
  };
  pengalaman: SessionPlan[];
  asesmen: {
    awal: string;
    proses: string;
    akhir: string;
  };
}
