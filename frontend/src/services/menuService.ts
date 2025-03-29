import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  size: 'small' | 'large';
  image_url: string | null;
  is_available: boolean;
  category: 'classic' | 'premium' | 'seasonal';
  tags: string[] | null;
}

export class MenuService {
  static async getMenuItems() {
    const { data: menuItems, error } = await supabase
      .from('lemonade_items')
      .select('*')
      .order('name');

    if (error) throw error;
    return menuItems as MenuItem[];
  }

  static async getAvailableMenuItems() {
    const { data: menuItems, error } = await supabase
      .from('lemonade_items')
      .select('*')
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return menuItems as MenuItem[];
  }

  static async updateItemAvailability(id: string, isAvailable: boolean) {
    const { error } = await supabase
      .from('lemonade_items')
      .update({ is_available: isAvailable })
      .eq('id', id);

    if (error) throw error;
  }
}
