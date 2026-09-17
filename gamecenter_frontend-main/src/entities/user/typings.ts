export interface RoleReference {
  curator_id: number | null;
  team_id: number | null;
  team_name: string | null;
}

export interface Me {
  user_id: number;
  is_curator: boolean;
  is_player: boolean;
  is_superuser: boolean;
  curator_data?: RoleReference | null;
  player_data?: RoleReference | null;
}
