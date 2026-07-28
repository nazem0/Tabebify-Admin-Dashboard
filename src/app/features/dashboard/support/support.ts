import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatType } from '../../../proxy/chats/chat-type.enum';
import type { ChatDto, ChatMessageDto } from '../../../proxy/chats/models';
import { AppInitialsPipe } from '../../../shared/pipes/initials.pipe';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { buildPageArray } from '../../../shared/utils/pagination.utils';

@Component({
  selector: 'app-support',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppInitialsPipe, RelativeDatePipe, DatePipe],
  templateUrl: './support.html',
})
export class SupportComponent {
  private readonly chatService = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = 20;

  protected readonly ChatType = ChatType;

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

  protected readonly supportChats = computed(() => {
    const q = this.search().toLowerCase();
    return this.allChats()
      .filter(c => c.type === ChatType.Support)
      .filter(
        c =>
          !q ||
          c.otherUserName?.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q),
      );
  });

  protected readonly selectedChat = computed(
    () => this.allChats().find(c => c.id === this.selectedChatId()) ?? null,
  );

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
  }

  protected onSearch(value: string): void {
    this.search.set(value);
  }

  protected onPageChange(p: number | null): void {
    if (p === null || p === this.page()) return;
    this.page.set(p);
    this.selectedChatId.set(null);
    this.messages.set([]);
    this.loadChatsTrigger$.next();
  }

  protected selectChat(chat: ChatDto): void {
    this.selectedChatId.set(chat.id ?? null);
    if (chat.id) {
      this.messagesTrigger$.next(chat.id);
    }
  }
}
