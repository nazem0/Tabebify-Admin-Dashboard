import type { BadgeScheme } from '../status-badge/status-badge';

export type ColumnType =
  | 'text'
  | 'avatar'
  | 'badge'
  | 'date'
  | 'rating'
  | 'currency'
  | 'booking'
  | 'actions';

export interface ActionConfig {
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showBlock?: boolean;
  showResetPassword?: boolean; 
}

export interface TableColumn {
  /** Property key on the row data object. Use any unique sentinel (e.g. '_actions') for non-data columns. */
  field: string;
  /** Column header label. */
  header: string;
  /** Determines how the cell is rendered. */
  type: ColumnType;
  /** Tailwind responsive utility appended to every cell in this column (e.g. 'hidden md:table-cell'). */
  responsiveClass?: string;
  /** For 'avatar' type — field used as the secondary subtitle line (e.g. 'email'). */
  subtitleField?: string;
  /** For 'badge' type — StatusBadge colour scheme. */
  scheme?: BadgeScheme;
  /** For 'rating' type — field holding the review count. */
  ratingCountField?: string;
  /** For 'currency' type — character prepended to the value (e.g. '$'). */
  prefix?: string;
  /** For 'actions' type — which action buttons to render. */
  actions?: ActionConfig;
  /**
   * Pure function that derives the display value from the full row object.
   * Use this when the value requires computation (e.g. boolean → 'active'|'blocked').
   */
  valueResolver?: (row: any) => any;
  /** Exclude this column from the CSV export. */
  skipExport?: boolean;
  /** Override the CSV header label; defaults to `header`. */
  exportHeader?: string;
}
