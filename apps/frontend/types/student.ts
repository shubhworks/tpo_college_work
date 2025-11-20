export interface Student {
  name: string
  university_enrolment_number: string
  email_id: string
  mobile_number: string
  branch: string
  college: string
  certification_done: string
  leetcode_profile_link: string
  github_profile_link: string
  linkedin_profile_link: string
  latest_resume_link: string
  student_folder_link: string
  upload_your_latest_professional_photo: string
}

export interface Certificate {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  size?: number
}

export interface BranchData {
  branch: string
  count: number
  icon: string
}
