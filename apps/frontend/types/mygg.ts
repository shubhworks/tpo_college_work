export interface MyGGSocialLink {
  id: string
  platform: string
  url: string
}

export interface MyGGCertificate {
  id: string
  title: string
  issuer?: string | null
  issueDate?: string | null
  fileUrl?: string | null
}

export interface MyGGProject {
  id: string
  title: string
  description?: string | null
  techStack?: string[]
  link?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface MyGGAchievement {
  id: string
  title: string
  description?: string | null
  category?: string | null
  date?: string | null
  fileUrl?: string | null
}

export interface MyGGStudent {
  id: string
  enrollmentNumber: string
  status: string
  firstName: string
  lastName: string
  fullName: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: string | null
  profileImageUrl?: string | null
  academic: {
    branch: {
      id: string
      shortCode: string
      name: string
    }
    admissionYear?: number | null
    passoutYear?: number | null
    currentSemester?: number | null
    section?: string | null
  }
  resumes?: {
    tech?: string | null
    nonTech?: string | null
  } | null
  links?: {
    linkedin?: string | null
    github?: string | null
    portfolio?: string | null
  } | null
  socialLinks?: MyGGSocialLink[]
  certificates?: MyGGCertificate[]
  projects?: MyGGProject[]
  achievements?: MyGGAchievement[]
}

export interface MyGGBranch {
  id: string
  shortCode: string
  name: string
  studentCount: number
}

export interface MyGGApiError {
  success?: boolean
  code?: string
  message?: string
}
