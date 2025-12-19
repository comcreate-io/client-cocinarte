export interface Clase {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO date string
  time: string; // HH:MM:SS format
  minStudents: number;
  maxStudents: number;
  enrolled: number; // number of students currently enrolled
  price: number;
  classDuration: number; // duration in minutes
  class_type?: 'Mini Chefcitos' | 'Chefcitos Together' | 'Cocina Creativa'; // type of cooking class
  image_url?: string | null; // URL to the class image
  cancelled_at?: string | null; // ISO timestamp when class was cancelled
  created_at: string;
  updated_at: string;
}

// Cocinarte-specific class types
export type CocinarteClassType = 
  | 'kids-basics'
  | 'teen-culinary'
  | 'family-workshop'
  | 'birthday-party'
  | 'healthy-cooking'
  | 'baking-fundamentals'
  | 'private-event'
  | 'mini-chef'
  | 'mom-me';

export interface CocinarteClase extends Clase {
  classType?: CocinarteClassType;
  ageGroup?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CreateClaseData {
  title: string;
  description?: string;
  date: string;
  time: string;
  minStudents: number;
  maxStudents: number;
  enrolled?: number; // optional, defaults to 0
  price: number;
  classDuration: number;
  class_type?: 'Mini Chefcitos' | 'Chefcitos Together' | 'Cocina Creativa';
  image_url?: string | null;
}

export interface UpdateClaseData extends Partial<CreateClaseData> {
  id: string;
}
