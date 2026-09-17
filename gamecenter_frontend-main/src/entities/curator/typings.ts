export interface Curator {
  id: number;
  name: string;
  /** Station assignment may be empty while the event is being configured. */
  station: number | null;
  user: number;
}
