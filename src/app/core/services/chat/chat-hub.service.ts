import { Injectable, inject, signal } from '@angular/core';
import { EnvironmentService } from '@abp/ng.core';
import { OAuthService } from 'angular-oauth2-oidc';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import type { ChatMessageDto } from '../../../proxy/chats/models';

export interface ChatMessageEvent {
  chatId: string;
  message: ChatMessageDto;
}

export interface MessagesReadEvent {
  chatId: string;
  readByUserId: string;
}

/** Matches backend MapHub path for Tabebify.Hubs.ChatHub. */
const HUB_PATH = '/hubs/chat';

@Injectable({ providedIn: 'root' })
export class ChatHubService {
  private readonly environment = inject(EnvironmentService);
  private readonly oAuthService = inject(OAuthService);

  private connection: HubConnection | null = null;
  private joinedChatId: string | null = null;
  private startPromise: Promise<void> | null = null;

  private readonly messageReceivedSubject = new Subject<ChatMessageEvent>();
  private readonly userTypingSubject = new Subject<string>();
  private readonly messagesReadSubject = new Subject<MessagesReadEvent>();

  readonly connected = signal(false);

  readonly messageReceived$: Observable<ChatMessageEvent> =
    this.messageReceivedSubject.asObservable();
  readonly userTyping$: Observable<string> = this.userTypingSubject.asObservable();
  readonly messagesRead$: Observable<MessagesReadEvent> =
    this.messagesReadSubject.asObservable();

  async start(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;
    if (this.startPromise) return this.startPromise;

    this.startPromise = this.connect().finally(() => {
      this.startPromise = null;
    });
    return this.startPromise;
  }

  async stop(): Promise<void> {
    this.joinedChatId = null;
    const conn = this.connection;
    this.connection = null;
    this.connected.set(false);
    if (conn) {
      try {
        await conn.stop();
      } catch {
        /* ignore disconnect errors */
      }
    }
  }

  async joinChat(chatId: string): Promise<void> {
    await this.start();
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) return;

    if (this.joinedChatId && this.joinedChatId !== chatId) {
      await this.leaveChat(this.joinedChatId);
    }
    if (this.joinedChatId === chatId) return;

    await this.connection.invoke('JoinChatGroup', chatId);
    this.joinedChatId = chatId;
  }

  async leaveChat(chatId?: string): Promise<void> {
    const id = chatId ?? this.joinedChatId;
    if (!id || !this.connection || this.connection.state !== HubConnectionState.Connected) {
      if (id && this.joinedChatId === id) this.joinedChatId = null;
      return;
    }

    try {
      await this.connection.invoke('LeaveChatGroup', id);
    } catch {
      /* leave is best-effort */
    }
    if (this.joinedChatId === id) this.joinedChatId = null;
  }

  async sendTyping(chatId: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) return;
    try {
      await this.connection.invoke('SendTypingIndicator', chatId);
    } catch {
      /* typing is best-effort */
    }
  }

  private async connect(): Promise<void> {
    const apiUrl = this.environment.getApiUrl('default').replace(/\/$/, '');
    const hubUrl = `${apiUrl}${HUB_PATH}`;

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        /* ignore */
      }
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.oAuthService.getAccessToken() || '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('MessageReceived', (chatId: string, message: ChatMessageDto) => {
      this.messageReceivedSubject.next({ chatId: String(chatId), message });
    });

    this.connection.on('UserTyping', (chatId: string) => {
      this.userTypingSubject.next(String(chatId));
    });

    this.connection.on('MessagesRead', (chatId: string, readByUserId: string) => {
      this.messagesReadSubject.next({
        chatId: String(chatId),
        readByUserId: String(readByUserId),
      });
    });

    this.connection.onreconnected(async () => {
      this.connected.set(true);
      const chatId = this.joinedChatId;
      this.joinedChatId = null;
      if (chatId) {
        try {
          await this.joinChat(chatId);
        } catch {
          /* rejoin best-effort */
        }
      }
    });

    this.connection.onclose(() => {
      this.connected.set(false);
      this.joinedChatId = null;
    });

    await this.connection.start();
    this.connected.set(true);
  }
}
