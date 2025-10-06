export enum EmailType {
  WELCOME = 'welcome',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_VERIFICATION = 'account_verification',
  NEWSLETTER = 'newsletter',
  COACHING_SESSION_FOLLOW_UP = 'coaching_session_follow_up',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  PAYMENT_FAILED = 'payment_failed',
  COURSE_ENROLLMENT = 'course_enrollment',
  FEEDBACK_REQUEST = 'feedback_request',
}

export interface EmailData {
  [key: string]: any;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}
