export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiStatus = 'active' | 'inactive' | 'error';

export interface KeyValue {
  key: string;
  value: string;
  required?: boolean;
}

export interface ApiConfig {
  id: string;
  name: string;
  path: string;
  method: HttpMethod;
  status: ApiStatus;
  description: string;
  headers: KeyValue[];
  queryParams: KeyValue[];
  requestBody?: string;
  responseExample: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  error: number;
}

export interface ApiListQuery {
  search?: string;
  method?: HttpMethod | 'ALL';
  status?: ApiStatus | 'ALL';
}
