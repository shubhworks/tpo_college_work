export interface AcademicDetails {
  marks10: number | null;
  marks12: number | null;
  cgpa: number | null;
  sem1?: number | null;
  sem2?: number | null;
  sem3?: number | null;
  sem4?: number | null;
  sem5?: number | null;
  sem6?: number | null;
  sem7?: number | null;
  sem8?: number | null;
  ug?: number | null;
}

export interface StudentV2 {
  id: number;
  rollNo: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string | null;
  dob?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  motherName?: string | null;
  currentAddress?: string | null;
  permanentAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  cast?: string | null;
  bloodGroup?: string | null;
  batch: {
    id: number | null;
    name: string;
  };
  course: {
    id: number | null;
    name: string;
  };
  branch: {
    id: number | null;
    name: string;
    code: string | null;
  };
  semester?: string | null;
  className?: string | null;
  sectionName?: string | null;
  image?: string | null;
  skills: string[];
  academicDetails?: AcademicDetails | null;
  collegeCertificates: Array<{
    id: number;
    certificateName: string;
    certificateNumber: string;
    issueDate: string;
    status: string;
    fileUrl: string | null;
  }>;
  otherCertificates: Array<{
    id: number;
    certificateName: string;
    issuingOrganization: string;
    issueDate: string;
    credentialId?: string | null;
    credentialUrl?: string | null;
    fileUrl?: string | null;
  }>;
}

export interface BatchItem {
  id: number;
  name: string;
  active?: number;
  studentCount?: number;
}

export interface CourseItem {
  id: number;
  name: string;
  active?: number;
  studentCount?: number;
}

export interface BranchItem {
  id: number;
  name: string;
  code: string;
  isActive?: number;
}

export interface FilterMeta {
  batches: BatchItem[];
  courses: CourseItem[];
  branches: BranchItem[];
  semesters: string[];
  skills: string[];
  genders: string[];
  categories: string[];
}

export interface MasterFilterState {
  batch: string;
  course: string;
  branches: string[]; // multi-select
  semester: string;
  minCgpa: string;
  min10th: string;
  min12th: string;
  skills: string[];
  skillsMatch: "any" | "all";
  hasVerifiedCert: boolean;
  hasOtherCert: boolean;
  gender: string;
  category: string;
  search: string;
}
