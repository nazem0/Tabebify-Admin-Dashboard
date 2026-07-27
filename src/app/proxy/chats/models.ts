import type { ChatType } from './chat-type.enum';

export interface ChatDto {
  id?: string;
  otherUserId?: string;
  otherUserName?: string;
  type?: ChatType;
  appointmentId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface ChatMessageDto {
  id?: string;
  senderId?: string;
  content?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface CreateSupportFaqDto {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface GetChatMessagesInput {
  before?: string;
  maxResultCount?: number;
}

export interface GetChatsInput {
  skipCount?: number;
  maxResultCount?: number;
}

export interface SendMessageDto {
  content: string;
}

export interface SupportFaqDto {
  id?: string;
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSupportFaqDto {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
}
