import { supabase } from '../../config/supabase';
import type { RegistrationCode } from '../../types/registrationCode';

export const findActiveCode = async (code: string): Promise<RegistrationCode | null> => {
  const { data, error } = await supabase
    .from('registration_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .gt('expiration_date', new Date().toISOString())
    .lt('used_count', supabase.raw('max_uses'))
    .single();

  if (error) {
    console.error('Error finding registration code:', error);
    return null;
  }

  return data;
};

export const useCode = async (codeId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('registration_code_usage')
    .insert({
      code_id: codeId,
      user_id: userId
    });

  if (error) {
    console.error('Error using registration code:', error);
    return false;
  }

  return true;
};

export const createRegistrationCode = async (code: Omit<RegistrationCode, 'id'>): Promise<RegistrationCode | null> => {
  const { data, error } = await supabase
    .from('registration_codes')
    .insert([code])
    .select()
    .single();

  if (error) {
    console.error('Error creating registration code:', error);
    return null;
  }

  return data;
};

export const updateRegistrationCode = async (id: string, code: Partial<RegistrationCode>): Promise<boolean> => {
  const { error } = await supabase
    .from('registration_codes')
    .update(code)
    .eq('id', id);

  if (error) {
    console.error('Error updating registration code:', error);
    return false;
  }

  return true;
};

export const deleteRegistrationCode = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('registration_codes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting registration code:', error);
    return false;
  }

  return true;
};

export const cleanExpiredCodes = async (): Promise<void> => {
  const { error } = await supabase.rpc('clean_expired_registration_codes');

  if (error) {
    console.error('Error cleaning expired codes:', error);
  }
};