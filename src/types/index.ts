export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  full_name?: string | null;
  is_admin?: boolean;
  plan?: string | null;
  company_name?: string | null;
  created_at?: string;
}
