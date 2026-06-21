import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  transform(date: string | Date | undefined | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }
}
