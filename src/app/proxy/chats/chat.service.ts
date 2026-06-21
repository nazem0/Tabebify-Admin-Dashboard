import type { ChatDto, ChatMessageDto, GetChatMessagesInput, SendMessageDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private restService = inject(RestService);
  apiName = 'Default';

  getChats = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<ChatDto>>(
      {
        method: 'GET',
        url: '/api/app/chat/chats',
      },
      { apiName: this.apiName, ...config },
    );

  getMessages = (chatId: string, input: GetChatMessagesInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ChatMessageDto>>(
      {
        method: 'GET',
        url: `/api/app/chat/messages/${chatId}`,
        params: { before: input.before, maxResultCount: input.maxResultCount },
      },
      { apiName: this.apiName, ...config },
    );

  getOrCreateSupportChat = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatDto>(
      {
        method: 'GET',
        url: '/api/app/chat/or-create-support-chat',
      },
      { apiName: this.apiName, ...config },
    );

  sendMessage = (chatId: string, input: SendMessageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatMessageDto>(
      {
        method: 'POST',
        url: `/api/app/chat/send-message/${chatId}`,
        body: input,
      },
      { apiName: this.apiName, ...config },
    );
}
