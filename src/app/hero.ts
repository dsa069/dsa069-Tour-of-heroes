import { Superpower } from './superpower';

export interface Hero {
  id: number;
  name: string;
  alterEgo?: string; // Match the backend model
  superpowers?: Superpower[]; // Match the backend model
  powers?: string[]; // For backwards compatibility
  imageUrl?: string;
}