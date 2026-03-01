import { createClient } from './client';
import { Booking, CreateBookingData, UpdateBookingData, BookingWithDetails } from '../types/bookings';

export class BookingsClientService {
  private supabase = createClient();

  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const { data, error } = await this.supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
    return data;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching booking: ${error.message}`);
    }
    return data;
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching user bookings: ${error.message}`);
    }
    return data || [];
  }

  async getBookingsWithDetails(userId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        class:clases(
          id,
          title,
          date,
          time,
          price,
          classDuration,
          late_cancel_refund_type,
          late_cancel_refund_value
        ),
        student:students(
          id,
          parent_name,
          child_name,
          email
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching bookings with details: ${error.message}`);
    }
    return data || [];
  }

  async updateBooking(updateData: UpdateBookingData): Promise<Booking> {
    const { id, ...updateFields } = updateData;
    const { data, error } = await this.supabase
      .from('bookings')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
    return data;
  }

  async deleteBooking(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting booking: ${error.message}`);
    }
  }

  async getBookingsByClassId(classId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('class_id', classId)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching class bookings: ${error.message}`);
    }
    return data || [];
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching bookings by date range: ${error.message}`);
    }
    return data || [];
  }
}
