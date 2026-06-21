import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials' })
export class AppInitialsPipe implements PipeTransform {
  transform(name: string | undefined | null): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
