import { useEffect, useState, useCallback } from 'react';
import { useApiStore } from '@/store/apiStore';
import Navbar from '@/components/Navbar';
import StatsCards from '@/components/StatsCards';
import FilterSidebar from '@/components/FilterSidebar';
import ApiCard from '@/components/ApiCard';
import ApiDetail from '@/components/ApiDetail';
import { StatCardSkeleton, ApiListSkeleton, SidebarSkeleton } from '@/components/Skeletons';
import { Inbox, Rocket } from 'lucide-react';

export default function Home() {
  const { configs, loading, fetchConfigs, fetchStats } = useApiStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchStats().then(() => {
      fetchConfigs();
    });
  }, [fetchStats, fetchConfigs]);

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setIsNew(false);
  }, []);

  const handleCreate = useCallback(() => {
    setIsNew(true);
    setSelectedId(null);
  }, []);

  if (selectedId || isNew) {
    return (
      <div className="min-h-screen">
        <Navbar onCreate={handleCreate} />
        <main className="container py-8 max-w-5xl">
          <ApiDetail id={selectedId} onBack={handleBack} isNew={isNew} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onCreate={handleCreate} />
      <main className="container py-8">
        <div className="mb-8">
          {loading ? <StatCardSkeleton /> : <StatsCards />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {loading ? <SidebarSkeleton /> : <FilterSidebar />}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-white">
                接口列表
                <span className="ml-2 text-sm font-normal text-dark-400">
                  共 {configs.length} 条
                </span>
              </h2>
              <button onClick={handleCreate} className="btn-secondary text-sm">
                <Rocket className="w-4 h-4" />
                快速创建
              </button>
            </div>

            {loading ? (
              <ApiListSkeleton />
            ) : configs.length === 0 ? (
              <div className="card py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-dark-700/50 flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-dark-500" />
                </div>
                <h3 className="font-display font-semibold text-white mb-1">暂无接口配置</h3>
                <p className="text-sm text-dark-400 mb-5">点击右上角"新建接口"创建第一个配置</p>
                <button onClick={handleCreate} className="btn-primary text-sm">
                  <Rocket className="w-4 h-4" />
                  创建接口
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {configs.map((cfg, idx) => (
                  <ApiCard
                    key={cfg.id}
                    config={cfg}
                    index={idx}
                    onClick={() => setSelectedId(cfg.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
