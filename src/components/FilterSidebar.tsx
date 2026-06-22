import { Filter, GitBranch, Activity } from 'lucide-react';
import { useApiStore } from '@/store/apiStore';
import type { HttpMethod, ApiStatus } from '@@/shared/types';

const methods: (HttpMethod | 'ALL')[] = ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const statuses: (ApiStatus | 'ALL')[] = ['ALL', 'active', 'inactive', 'error'];

const methodLabels: Record<HttpMethod | 'ALL', string> = {
  ALL: '全部方法',
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

const statusLabels: Record<ApiStatus | 'ALL', string> = {
  ALL: '全部状态',
  active: '运行中',
  inactive: '已停用',
  error: '异常',
};

export default function FilterSidebar() {
  const { filters, setFilters, fetchConfigs } = useApiStore();

  const handleMethodChange = (method: HttpMethod | 'ALL') => {
    setFilters({ method });
    fetchConfigs({ method });
  };

  const handleStatusChange = (status: ApiStatus | 'ALL') => {
    setFilters({ status });
    fetchConfigs({ status });
  };

  return (
    <aside className="card p-5 h-fit sticky top-24 animate-fade-in" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-primary-400" />
        <h3 className="font-display font-semibold text-white">筛选</h3>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <GitBranch className="w-3.5 h-3.5 text-dark-400" />
            <span className="label !mb-0">请求方法</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {methods.map((m) => {
              const active = filters.method === m;
              return (
                <button
                  key={m}
                  onClick={() => handleMethodChange(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    active
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                      : 'bg-dark-700/50 text-dark-300 border border-transparent hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  {methodLabels[m]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Activity className="w-3.5 h-3.5 text-dark-400" />
            <span className="label !mb-0">接口状态</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => {
              const active = filters.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    active
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                      : 'bg-dark-700/50 text-dark-300 border border-transparent hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
