import type { StantionsOrder, Stantion } from "../stantion";

export interface ParticipantTeam {
  id: number;
  teamname: string;
  score: number;
  user: number;

  /** id объекта с порядком станций; назначается организатором позже */
  stations: StantionsOrder["id"] | null;
  current_station: Stantion["id"];
}

export interface SaveScoreResponse {
  score: number;
  current_station: number;
}
