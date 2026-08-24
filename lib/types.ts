export interface Admin {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

export interface Center {
  id: number;
  name: string;
  email: string;
  mobile: string;
  state: string;
  city: string;
}

export interface Category {
  name: string;
  description: string;
}

export interface Location {
  state: string;
  city: string;
}

export interface Criminal {
  id: number;
  name: string;
  gender: string;
  dob: string;
  mobile: string;
  address: string;
  family_member: string;
  relation_type?: string;
  member_contact: string;
  image: string | null;
  category: string;
  dataset_images: string[];
  dataset_count: number;
}

export interface Remark {
  id: number;
  criminal_id: number;
  criminal_name: string;
  center_id: number;
  date: string;
  time: string;
  description: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  date: string;
  criminal_name: string;
  contact: string;
  email: string;
  address: string;
}

export interface DashboardStats {
  role: string;
  total_admins?: number;
  total_centers?: number;
  total_criminals?: number;
  total_categories?: number;
  total_locations?: number;
  total_remarks?: number;
  total_reports?: number;
  my_remarks?: number;
}
