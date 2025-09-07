import { User } from './user';
import { instruction } from './instruction';
import { availability } from './availability';

export type Assistant = {
  id: number | string;
  name: string;
  description: string;
  instruction: instruction;
  personality: string | null;
  robotEmulation: boolean;
  goal: string | null;
  availability: availability;
  maxResponseLength: number;
  responseSpeed: number;
  provider: any;
  user: User;
  textGenerations: unknown;
};
