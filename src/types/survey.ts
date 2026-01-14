export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'yesno';

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  required: boolean;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
  creatorOrganization?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
}
