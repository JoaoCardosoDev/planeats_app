// API service for pantry-related operations

// Use localhost for browser requests (Docker internal URLs don't work from browser)
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Browser: use localhost
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Server: use env var

export interface PantryItemCreate {
  item_name: string;
  quantity: number;
  unit: string;
  expiration_date?: string; // ISO date string (YYYY-MM-DD)
  purchase_date?: string; // ISO date string (YYYY-MM-DD)
  calories_per_unit?: number;
}

export interface PantryItemRead {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  expiration_date?: string;
  purchase_date?: string;
  calories_per_unit?: number;
  user_id: number;
  added_at: string; // ISO datetime string
}

export interface PantryItemUpdate {
  item_name?: string;
  quantity?: number;
  unit?: string;
  expiration_date?: string;
  purchase_date?: string;
  calories_per_unit?: number;
}

export interface PantryListResponse {
  items: PantryItemRead[];
  total: number;
  skip: number;
  limit: number;
}

class PantryAPI {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // TODO: Integrate with NextAuth.js to get the JWT token
    // For now, return empty headers - this will be implemented when integrating auth
    return {
      'Content-Type': 'application/json',
    };
  }

  async createPantryItem(item: PantryItemCreate): Promise<PantryItemRead> {
    const url = `${API_BASE_URL}/api/v1/pantry/items`;
    
    console.log('Creating pantry item:', item);
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to create pantry item: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  }

  async getPantryItems(skip: number = 0, limit: number = 100): Promise<PantryItemRead[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const url = `${API_BASE_URL}/api/v1/pantry/items?${params.toString()}`;
    
    console.log('Getting pantry items from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch pantry items: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  }

  async getPantryItemById(id: number): Promise<PantryItemRead> {
    const response = await fetch(`${API_BASE_URL}/api/v1/pantry/items/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch pantry item: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async updatePantryItem(id: number, item: PantryItemUpdate): Promise<PantryItemRead> {
    const response = await fetch(`${API_BASE_URL}/api/v1/pantry/items/${id}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to update pantry item: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async deletePantryItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/pantry/items/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to delete pantry item: ${response.status} ${response.statusText}. ${errorText}`);
    }
  }
}

export const pantryAPI = new PantryAPI();
