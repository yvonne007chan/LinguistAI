export type UserProficiency = 'A1 初级' | 'A2 初级' | 'B1 中级' | 'B2 中高级' | 'C1 高级';

export interface DialogueAction {
  foreign_teacher_reply: string;
  reply_translation: string;
}

export interface NativeExpression {
  phrase: string;
  explanation: string;
}

export interface PolishingFeedback {
  has_error: boolean;
  grammar_correction: string;
  native_expressions: NativeExpression[];
}

export interface AppControl {
  suggested_next_topics: string[];
}

export interface TutorResponse {
  dialogue_action: DialogueAction;
  polishing_feedback: PolishingFeedback;
  app_control: AppControl;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  feedback?: PolishingFeedback;
  suggestions?: string[];
}
