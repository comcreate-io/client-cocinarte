import { createClient } from './server';
import { Clase, CreateClaseData, UpdateClaseData, CocinarteClassType } from '../types/clases';

export class ClasesService {
  private supabase = createClient();

  async getAllClases(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching clases: ${error.message}`);
    }

    return data || [];
  }

  async getClaseById(id: string): Promise<Clase | null> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching clase: ${error.message}`);
    }

    return data;
  }

  async getClasesByDate(date: string): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching clases by date: ${error.message}`);
    }

    return data || [];
  }

  async getUpcomingClases(): Promise<Clase[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .gte('date', today)
      .is('cancelled_at', null)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching upcoming clases: ${error.message}`);
    }

    return data || [];
  }

  async createClase(claseData: CreateClaseData): Promise<Clase> {
    const { data, error } = await this.supabase
      .from('clases')
      .insert([claseData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating clase: ${error.message}`);
    }

    return data;
  }

  async updateClase(updateData: UpdateClaseData): Promise<Clase> {
    const { id, ...updateFields } = updateData;
    
    const { data, error } = await this.supabase
      .from('clases')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating clase: ${error.message}`);
    }

    return data;
  }

  async deleteClase(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('clases')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting clase: ${error.message}`);
    }
  }

  async getClasesByDateRange(startDate: string, endDate: string): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching clases by date range: ${error.message}`);
    }

    return data || [];
  }

  async getAvailableSlots(claseId: string): Promise<{ available: number; total: number }> {
    const clase = await this.getClaseById(claseId);
    if (!clase) {
      throw new Error('Clase not found');
    }

    // This would need to be implemented based on your student enrollment system
    // For now, returning the max students as available
    return {
      available: clase.maxStudents,
      total: clase.maxStudents
    };
  }

  // Cocinarte-specific methods
  async getKidsClasses(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .or('title.ilike.%kids%,title.ilike.%children%,title.ilike.%family%')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching kids classes: ${error.message}`);
    }

    return data || [];
  }

  async getTeenClasses(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .or('title.ilike.%teen%,title.ilike.%teenager%,title.ilike.%advanced%')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching teen classes: ${error.message}`);
    }

    return data || [];
  }

  async getBirthdayPartyClasses(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .or('title.ilike.%birthday%,title.ilike.%party%,title.ilike.%celebration%')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching birthday party classes: ${error.message}`);
    }

    return data || [];
  }

  async getBakingClasses(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .or('title.ilike.%baking%,title.ilike.%bread%,title.ilike.%cookies%,title.ilike.%pastries%')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching baking classes: ${error.message}`);
    }

    return data || [];
  }

  async getHealthyCookingClasses(): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .or('title.ilike.%healthy%,title.ilike.%nutritious%')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching healthy cooking classes: ${error.message}`);
    }

    return data || [];
  }

  async getClassesByAgeGroup(ageGroup: string): Promise<Clase[]> {
    const { data, error } = await this.supabase
      .from('clases')
      .select('*')
      .ilike('description', `%${ageGroup}%`)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching classes by age group: ${error.message}`);
    }

    return data || [];
  }
}
