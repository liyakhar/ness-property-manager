export enum TenantStatus {
  CURRENT = 'current',
  PAST = 'past',
  FUTURE = 'future',
  UPCOMING = 'upcoming',
}

export enum ColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  TEXTAREA = 'textarea',
  APARTMENT = 'apartment',
  STATUS = 'status',
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum DateFormat {
  DD_MM = 'DD/MM',
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD = 'MM/DD',
  MM_DD_YYYY = 'MM/DD/YYYY',
}
