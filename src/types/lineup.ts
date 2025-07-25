export interface EventLineup {
  id: string;
  event_id: string;
  artist_name: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  stage_name?: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CurrentPerformer {
  lineup_id: string;
  artist_name: string;
  start_time: string;
  end_time: string;
  stage_name?: string;
  description?: string;
}