import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, debounceTime, filter } from 'rxjs';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatType } from '../../../proxy/chats/chat-type.enum';
import type { ChatDto, ChatMessageDto } from '../../../proxy/chats/models';
import { ChatHubService } from '../../../core/services/chat/chat-hub.service';
import { AppInitialsPipe } from '../../../shared/pipes/initials.pipe';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { buildPageArray } from '../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-support',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppInitialsPipe, RelativeDatePipe, DatePipe, NgClass],
  templateUrl: './support.html',
})
export class SupportComponent {
  private readonly chatService = inject(ChatService);
  private readonly chatHub = inject(ChatHubService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 20;

  protected readonly allChats = signal<ChatDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly page = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly isLoadingChats = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly selectedChatId = signal<string | null>(null);
  protected readonly messages = signal<ChatMessageDto[]>([]);
  protected readonly isLoadingMessages = signal(false);
  protected readonly replyDraft = signal('');
  protected readonly isSending = signal(false);
  protected readonly sendError = signal<string | null>(null);
  protected readonly isOtherTyping = signal(false);

  private typingClearTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly typingEmit$ = new Subject<string>();

  protected readonly supportChats = computed(() => {
    const q = this.search().toLowerCase();
    return this.allChats().filter(
      c =>
        !q ||
        c.otherUserName?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q),
    );
  });

  protected readonly selectedChat = computed(
    () => this.allChats().find(c => c.id === this.selectedChatId()) ?? null,
  );

  /** Reply is only allowed on Support chats (type coerced so string "1" still matches). */
  protected readonly canReply = computed(() => this.isSupportChat(this.selectedChat()));

  protected readonly totalUnread = computed(() =>
    this.supportChats().reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
  );

  protected readonly activeCount = computed(
    () => this.supportChats().filter(c => (c.unreadCount ?? 0) > 0).length,
  );

  protected readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  protected readonly pages = computed(() => buildPageArray(this.totalPages(), this.page()));

  private readonly loadChatsTrigger$ = new Subject<void>();
  private readonly messagesTrigger$ = new Subject<string>();

  constructor() {
    void this.chatHub.start().catch(() => {
      /* realtime optional — HTTP chat still works */
    });

    this.destroyRef.onDestroy(() => {
      if (this.typingClearTimer) clearTimeout(this.typingClearTimer);
      void this.chatHub.stop();
    });

    this.loadChatsTrigger$
      .pipe(
        switchMap(() => {
          this.isLoadingChats.set(true);
          this.error.set(null);
          return this.chatService.getChats({
            skipCount: this.page() * this.pageSize,
            maxResultCount: this.pageSize,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.allChats.set(result.items ?? []);
          this.totalCount.set(result.totalCount ?? 0);
          this.isLoading.set(false);
          this.isLoadingChats.set(false);
        },
        error: () => {
          this.error.set('Failed to load support chats. Please try again.');
          this.isLoading.set(false);
          this.isLoadingChats.set(false);
        },
      });

    this.loadChatsTrigger$.next();

    this.messagesTrigger$
      .pipe(
        switchMap(chatId => {
          this.isLoadingMessages.set(true);
          return this.chatService.getMessages(chatId, { maxResultCount: 50 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.messages.set(result.items ?? []);
          this.isLoadingMessages.set(false);
        },
        error: () => this.isLoadingMessages.set(false),
      });

    this.chatHub.messageReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ chatId, message }) => this.onHubMessage(chatId, message));

    this.chatHub.userTyping$
      .pipe(
        filter(chatId => chatId === this.selectedChatId()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.flashTyping());

    this.typingEmit$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(chatId => {
        void this.chatHub.sendTyping(chatId);
      });
  }

  protected onSearch(value: string): void {
    this.search.set(value);
  }

  protected onPageChange(p: number | null): void {
    if (p === null || p === this.page()) return;
    const previousId = this.selectedChatId();
    this.page.set(p);
    this.selectedChatId.set(null);
    this.messages.set([]);
    this.replyDraft.set('');
    this.sendError.set(null);
    this.isOtherTyping.set(false);
    if (previousId) void this.chatHub.leaveChat(previousId);
    this.loadChatsTrigger$.next();
  }

  protected selectChat(chat: ChatDto): void {
    const previousId = this.selectedChatId();
    this.selectedChatId.set(chat.id ?? null);
    this.replyDraft.set('');
    this.sendError.set(null);
    this.isOtherTyping.set(false);
    if (!chat.id) return;

    if (previousId && previousId !== chat.id) {
      void this.chatHub.leaveChat(previousId);
    }

    this.messagesTrigger$.next(chat.id);
    void this.chatHub.joinChat(chat.id).catch(() => {
      /* join may fail if backend denies admin participant access */
    });

    if ((chat.unreadCount ?? 0) > 0) {
      this.allChats.update(chats =>
        chats.map(c => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)),
      );
      this.chatService.markAsRead(chat.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => {
          /* unread cleared optimistically; ignore mark-as-read failures */
        },
      });
    }
  }

  protected clearSelection(): void {
    const previousId = this.selectedChatId();
    this.selectedChatId.set(null);
    this.messages.set([]);
    this.replyDraft.set('');
    this.sendError.set(null);
    this.isOtherTyping.set(false);
    if (previousId) void this.chatHub.leaveChat(previousId);
  }

  protected onReplyDraft(value: string): void {
    this.replyDraft.set(value);
    const chatId = this.selectedChatId();
    if (chatId && this.canReply() && value.trim()) {
      this.typingEmit$.next(chatId);
    }
  }

  protected onReplyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendReply();
    }
  }

  protected sendReply(): void {
    const chat = this.selectedChat();
    const chatId = chat?.id;
    const content = this.replyDraft().trim();
    if (!chatId || !content || this.isSending() || !this.isSupportChat(chat)) return;

    this.isSending.set(true);
    this.sendError.set(null);

    this.chatService
      .sendMessage(chatId, { content })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: message => {
          this.appendMessage(chatId, message);
          this.replyDraft.set('');
          this.isSending.set(false);
        },
        error: () => {
          this.sendError.set('Failed to send message. Please try again.');
          this.isSending.set(false);
        },
      });
  }

  protected isSupportChat(chat: ChatDto | null | undefined): boolean {
    return chat != null && Number(chat.type) === ChatType.Support;
  }

  protected chatTypeLabel(chat: ChatDto | null | undefined): string {
    if (this.isSupportChat(chat)) return 'Support';
    if (chat != null && Number(chat.type) === ChatType.Appointment) return 'Appointment';
    return 'Conversation';
  }

  private onHubMessage(chatId: string, message: ChatMessageDto): void {
    if (this.selectedChatId() === chatId) {
      this.appendMessage(chatId, message);
      this.isOtherTyping.set(false);
      return;
    }

    this.allChats.update(chats =>
      chats.map(c =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: message.content ?? c.lastMessage,
              lastMessageAt: message.createdAt ?? new Date().toISOString(),
              unreadCount: (c.unreadCount ?? 0) + 1,
            }
          : c,
      ),
    );
  }

  private appendMessage(chatId: string, message: ChatMessageDto): void {
    this.messages.update(msgs => {
      if (message.id && msgs.some(m => m.id === message.id)) return msgs;
      return [...msgs, message];
    });
    this.allChats.update(chats =>
      chats.map(c =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: message.content ?? c.lastMessage,
              lastMessageAt: message.createdAt ?? new Date().toISOString(),
            }
          : c,
      ),
    );
  }

  private flashTyping(): void {
    this.isOtherTyping.set(true);
    if (this.typingClearTimer) clearTimeout(this.typingClearTimer);
    this.typingClearTimer = setTimeout(() => this.isOtherTyping.set(false), 2500);
  }
}
