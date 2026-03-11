export type UserRole = "APPLICANT" | "HR" | "SUPER_ADMIN";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
};

export type ApplicantRegistrationResponse = {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  message: string;
};

export type DashboardSummary = {
  totalApplicants: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  pendingVerification: number;
  totalUsers: number;
};

export type DashboardOverview = {
  summary: DashboardSummary;
  statusBreakdown: { status: string; count: number }[];
  dailySubmissions: { day: string; count: number }[];
  decisionTrend: { day: string; approved: number; rejected: number }[];
  userRoleBreakdown: { role: string; count: number }[];
  reviewerWorkload: { reviewerName: string; reviewedCount: number }[];
  recentSubmissions: {
    applicationId: string;
    applicationNumber: string;
    fullName: string;
    status: string;
    submittedAt: string;
  }[];
};

export type HrApplicantRow = {
  applicationId: string;
  applicationNumber: string;
  fullName: string;
  status: string;
  submittedAt: string;
};

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadataJson: string | null;
  createdAt: string;
};

export type ApplicantProfile = {
  nationalIdNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  addressLine: string | null;
  province: string | null;
  district: string | null;
  schoolName: string | null;
  grade: string | null;
  optionAttended: string | null;
  completionYear: number | null;
  nidaVerified: boolean;
  nesaVerified: boolean;
};

export type ApplicationStatus = {
  applicationId: string;
  applicationNumber: string;
  status: string;
  rejectionReason: string | null;
  decisionNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  history: { status: string; reason: string | null; changedAt: string }[];
};

export type HrApplicationDetail = {
  applicationId: string;
  applicationNumber: string;
  status: string;
  rejectionReason: string | null;
  decisionNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  applicant: {
    profileId: string;
    firstName: string;
    lastName: string;
    nationalIdNumber: string;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    addressLine: string | null;
    province: string | null;
    district: string | null;
    schoolName: string | null;
    grade: string | null;
    optionAttended: string | null;
    completionYear: number | null;
  };
  documents: {
    documentId: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    downloadPath: string;
  }[];
  history: { status: string; reason: string | null; changedAt: string }[];
};
