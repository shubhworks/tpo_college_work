export interface Student {
  university_enrolment_number: string
  name: string
  branch: string
  college: string
  email_id?: string
  mobile_number?: string
  upload_your_latest_professional_photo?: string
  latest_resume_link?: string
  student_folder_link?: string
  github_profile_link?: string
  linkedin_profile_link?: string
  leetcode_profile_link?: string
}

export interface Certificate {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  thumbnailLink?: string
}

export interface Program {
  id: string
  title: string
  slug: string // e.g. "CSE"
  description: string
  duration: string
}
