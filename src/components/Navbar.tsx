import { Search, Plus, Terminal, RefreshCw } from 'lucide-react';
import { useApiStore } from '@/store/apiStore';
import { useState, useTransition } from 'react';

interface NavbarProps {
  onCreate: () => void;
}

export default function Navbar({ onCreate }: NavbarProps) {
  const { filters, setFilters, fetchConfigs } = useApiStore();
  const [inputValue, setInputValue] = useState(filters.search || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    startTransition(() => {
      setFilters({ search: val });
      fetchConfigs({ search: val });
    });
  };

  const handleRefresh = () => {
    fetchConfigs();
    useApiStore.getState().fetchStats();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-dark-700/50">
      <div className="container flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-grad-primary flex items-center justify-center shadow-glow-primary">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-white">API Console</h1>
            <p className="text-xs text-dark-400 -mt-0.5">接口配置管理中心</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={inputValue}
              onChange={handleSearch}
              placeholder="搜索接口名称、路径..."
              className="input pl-9 pr-4 py-2 text-sm"
            />
          </div>
          <button onClick={handleRefresh} className="btn-secondary !px-2.5 !py-2" title="刷新">
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            <span>新建接口</span>
          </button>
        </div>
      </div>
    </header>
  );
}
