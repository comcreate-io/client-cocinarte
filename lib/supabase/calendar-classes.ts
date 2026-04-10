import { createClient } from './client';
import { Clase } from '../types/clases';

export interface CalendarClass {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "mini-chef" | "mom-me";
  class_type?: string;
  price: number;
  description?: string;
  minStudents: number;
  maxStudents: number;
  enrolled: number;
  classDuration: number;
  image_url?: string | null;
  requires_parent?: boolean;
  min_age?: number | null;
  max_age?: number | null;
  reserved_spots?: number;
}

export class CalendarClassesService {
  private supabase = createClient();

  async getAllCalendarClases(): Promise<CalendarClass[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .gte('date', today)
      .is('cancelled_at', null)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar classes:', error);
      return [];
    }

    return (data || []).map(this.transformToCalendarClass);
  }

  async getClasesByDateRange(startDate: string, endDate: string): Promise<CalendarClass[]> {
    // Ensure we never return classes in the past
    const today = new Date().toISOString().split('T')[0]
    const effectiveStart = startDate < today ? today : startDate

    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .gte('date', effectiveStart)
      .lte('date', endDate)
      .is('cancelled_at', null)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar classes by date range:', error);
      return [];
    }

    return (data || []).map(this.transformToCalendarClass);
  }

  async getClasesByMonth(year: number, month: number): Promise<CalendarClass[]> {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    return this.getClasesByDateRange(startDate, endDate);
  }

  private transformToCalendarClass(clase: any): CalendarClass {
    // Parse time in HH:MM:SS format
    const timeString = clase.time || '13:00:00';
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Calculate end time based on class duration
    const totalMinutes = hours * 60 + minutes + (clase.classDuration || 120);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    // Format times as 12-hour with AM/PM
    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHours = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${displayHours}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const formattedTime = `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;

    // Determine class type based on title or price
    // You can adjust this logic based on your needs
    const type = clase.title?.toLowerCase().includes('mom') || 
                 clase.title?.toLowerCase().includes('family') ||
                 clase.price >= 100 ? 'mom-me' : 'mini-chef';

    return {
      id: clase.id,
      title: clase.title,
      date: new Date(clase.date + 'T00:00:00'),
      time: formattedTime,
      type: type as "mini-chef" | "mom-me",
      class_type: clase.class_type,
      price: clase.price,
      description: clase.description,
      minStudents: clase.minStudents,
      maxStudents: clase.maxStudents,
      enrolled: clase.enrolled || 0,
      classDuration: clase.classDuration,
      image_url: clase.image_url,
      requires_parent: clase.requires_parent ?? false,
      min_age: clase.min_age ?? null,
      max_age: clase.max_age ?? null,
      reserved_spots: clase.reserved_spots ?? 0
    };
  }
}
