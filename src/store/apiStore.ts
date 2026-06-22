import { create } from 'zustand';
import { loadWithPriority, prefetchResource } from '@/utils/resourceLoader';
import type { ApiConfig, Stats, ApiListQuery, HttpMethod, ApiStatus } from '@@/shared/types';

interface ApiState {
  configs: ApiConfig[];
  stats: Stats;
  loading: boolean;
  detailLoading: boolean;
  currentDetail: ApiConfig | null;
  filters: ApiListQuery;
  fetchConfigs: (query?: ApiListQuery) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  prefetchDetail: (id: string) => void;
  createConfig: (data: Partial<ApiConfig>) => Promise<ApiConfig | null>;
  updateConfig: (id: string, data: Partial<ApiConfig>) => Promise<ApiConfig | null>;
  deleteConfig: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<ApiListQuery>) => void;
}

const initialStats: Stats = { total: 0, active: 0, inactive: 0, error: 0 };

export const useApiStore = create<ApiState>((set, get) => ({
  configs: [],
  stats: initialStats,
  loading: false,
  detailLoading: false,
  currentDetail: null,
  filters: { search: '', method: 'ALL', status: 'ALL' },

  fetchConfigs: async (query) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      const merged = { ...get().filters, ...query };
      if (merged.search) params.set('search', merged.search);
      if (merged.method && merged.method !== 'ALL') params.set('method', merged.method);
      if (merged.status && merged.status !== 'ALL') params.set('status', merged.status);
      const qs = params.toString();
      const url = `/api/configs${qs ? `?${qs}` : ''}`;

      const data = await loadWithPriority<ApiConfig[]>(
        `configs:${qs || 'all'}`,
        query ? 'high' : 'critical',
        async () => {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        },
        url,
      );
      set({ configs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const data = await loadWithPriority<Stats>(
        'stats',
        'critical',
        async () => {
          const res = await fetch('/api/stats');
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        },
        '/api/stats',
      );
      set({ stats: data });
    } catch {
      /* ignore */
    }
  },

  fetchDetail: async (id: string) => {
    set({ detailLoading: true });
    try {
      const data = await loadWithPriority<ApiConfig>(
        `config:${id}`,
        'high',
        async () => {
          const res = await fetch(`/api/configs/${id}`);
          if (!res.ok) throw new Error('Not found');
          return res.json();
        },
        `/api/configs/${id}`,
      );
      set({ currentDetail: data, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  prefetchDetail: (id: string) => {
    prefetchResource<ApiConfig>(
      `config:${id}`,
      'low',
      async () => {
        const res = await fetch(`/api/configs/${id}`);
        if (!res.ok) throw new Error('Not found');
        return res.json();
      },
      `/api/configs/${id}`,
    );
  },

  createConfig: async (data) => {
    try {
      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        get().fetchConfigs();
        get().fetchStats();
        return created;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateConfig: async (id, data) => {
    try {
      const res = await fetch(`/api/configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        get().fetchConfigs();
        get().fetchStats();
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteConfig: async (id) => {
    try {
      const res = await fetch(`/api/configs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        get().fetchConfigs();
        get().fetchStats();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  setFilters: (filters) => {
    const merged = { ...get().filters, ...filters };
    set({ filters: merged });
  },
}));

export const getMethodBadgeClass = (method: HttpMethod): string => {
  const map: Record<HttpMethod, string> = {
    GET: 'badge-get',
    POST: 'badge-post',
    PUT: 'badge-put',
    DELETE: 'badge-delete',
    PATCH: 'badge-patch',
  };
  return map[method] || 'badge-post';
};

export const getStatusBadgeClass = (status: ApiStatus): string => {
  const map: Record<ApiStatus, string> = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    error: 'badge-error',
  };
  return map[status];
};

export const getStatusText = (status: ApiStatus): string => {
  const map: Record<ApiStatus, string> = {
    active: '运行中',
    inactive: '已停用',
    error: '异常',
  };
  return map[status];
};
