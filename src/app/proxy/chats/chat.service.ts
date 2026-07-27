import type {
  ChatDto,
  ChatMessageDto,
  GetChatMessagesInput,
  GetChatsInput,
  SendMessageDto,
} from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private restService = inject(RestService);
  apiName = 'Default';

  createOrGetSupportChat = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatDto>(
      {
        method: 'POST',
        url: '/create-or-get-support-chat',
      },
      { apiName: this.apiName, ...config },
    );

  getChat = (chatId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatDto>(
      {
        method: 'GET',
        url: `/${chatId}`,
      },
      { apiName: this.apiName, ...config },
    );

  getChats = (input: GetChatsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ChatDto>>(
      {
        method: 'GET',
        url: '/chats',
        params: { skipCount: input.skipCount, maxResultCount: input.maxResultCount },
      },
      { apiName: this.apiName, ...config },
    );

  getMessages = (chatId: string, input: GetChatMessagesInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ChatMessageDto>>(
      {
        method: 'GET',
        url: `/messages/${chatId}`,
        params: { before: input.before, maxResultCount: input.maxResultCount },
      },
      { apiName: this.apiName, ...config },
    );

  getOrCreateAppointmentChat = (appointmentId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatDto>(
      {
        method: 'POST',
        url: `/or-create-appointment-chat/${appointmentId}`,
      },
      { apiName: this.apiName, ...config },
    );

  markAsRead = (chatId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>(
      {
        method: 'POST',
        url: `/mark-as-read/${chatId}`,
      },
      { apiName: this.apiName, ...config },
    );

  sendMessage = (chatId: string, input: SendMessageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatMessageDto>(
      {
        method: 'POST',
        url: `/send-message/${chatId}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
