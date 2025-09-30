export interface Project {
  id: number;
  user_id: string;
  project_name: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  ai_summary?: string;
  ai_summary_public?: boolean;
  description?: string;
  status: string;
  cover_image_url?: string;
  cover_image_storage_path?: string;
  is_shared: boolean;
  share_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface Marker {
  id: number;
  user_id: string;
  project_id: number;
  marker_name: string;
  marker_description: string;
  latitude: number;
  longitude: number;
  geojson: any;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  opacity: number;
  status: string;
}

export interface Route {
  id: number;
  user_id: string;
  project_id: number;
  route_name: string;
  description: string;
  route_color: string;
  route_width: string;
  route_opacity: number;
  geojson: any;
  route_distance: number;
  total_duration: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  start_time: string;
  end_time: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface Image {
  id: number;
  user_id: string;
  entity_type: 'marker' | 'route';
  entity_id: number;
  storage_path: string;
  url: string;
  description: string;
  order: number;
  created_at: string;
  is_deleted: boolean;
}

export interface UserSettings {
  id: number;
  user_id: string;
  layer: string;
  route_color: string;
  route_width: string;
  route_opacity: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureInfo {
  id: number;
  type: 'marker' | 'route';
  name: string;
  description: string;
  color: string;
  width: string;
  opacity: number;
  latitude?: number;
  longitude?: number;
  route_distance?: number;
  status?: 'visited' | 'not_visited';
}

export interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  place_type: string[];
  center: [number, number];
  context?: Array<{
    id: string;
    text: string;
  }>;
}

// Re-export feedback types
export * from './feedback';
