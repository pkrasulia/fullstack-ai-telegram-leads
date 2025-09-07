import { User } from './user';

export type instruction = {
  id: number | string;
  prompt: string;
  assistant: unknown;
  user: User;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};
