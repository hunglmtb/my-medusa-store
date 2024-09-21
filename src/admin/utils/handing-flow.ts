
export enum TaskProperties {
  sendGuidelines,
  applicantPassportUrl,
  sendInvitationLetters,
  completePrepare,
  visaResult,
  completeVisa,
}

export const TaskPropertiesTexts: Record<string, string> = {
  [TaskProperties[TaskProperties.sendGuidelines]]: 'Send guideline and addition information of the project to Applicant (over Zalo group)',
  [TaskProperties[TaskProperties.applicantPassportUrl]]: 'Applicant Passport',
  [TaskProperties[TaskProperties.sendInvitationLetters]]: 'Send Invitation Letters',
}

export enum HandingStep {
  PendingApprove= 'PENDING_APPROVE',
  PreVisaApplication= 'PRE_VISA_APPLICATION',
  SubmittedVisaApplication= 'SUBMITTED_VISA_APPLICATION',
  RePreVisaApplication= 'RE_PRE_VISA_APPLICATION',
  ReSubmittedVisaApplication= 'RE_SUBMITTED_VISA_APPLICATION',
  COMPLETED= 'COMPLETED',
}
