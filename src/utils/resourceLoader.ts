type Priority = 'critical' | 'high' | 'normal' | 'low';

interface Task<T> {
  id: string;
  priority: Priority;
  loader: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  timestamp: number;
}

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

class ResourceLoader {
  private maxConcurrent: number;
  private activeCount: number = 0;
  private queue: Task<unknown>[] = [];
  private running = new Set<string>();
  private cache = new Map<string, unknown>();

  constructor(maxConcurrent: number = 4) {
    this.maxConcurrent = Math.max(1, Math.min(maxConcurrent, 6));
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority];
      const pb = PRIORITY_ORDER[b.priority];
      if (pa !== pb) return pa - pb;
      return a.timestamp - b.timestamp;
    });
  }

  private async processNext() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;

    this.sortQueue();
    const task = this.queue.shift()!;

    if (this.running.has(task.id)) {
      this.processNext();
      return;
    }

    if (this.cache.has(task.id)) {
      task.resolve(this.cache.get(task.id) as never);
      this.processNext();
      return;
    }

    this.activeCount++;
    this.running.add(task.id);

    try {
      const result = await task.loader();
      this.cache.set(task.id, result);
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    } finally {
      this.activeCount--;
      this.running.delete(task.id);
      this.processNext();
    }
  }

  load<T>(id: string, priority: Priority, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(id)) {
      return Promise.resolve(this.cache.get(id) as T);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id,
        priority,
        loader: loader as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
      });
      this.processNext();
    });
  }

  preload<T>(id: string, priority: Priority, loader: () => Promise<T>): void {
    if (!this.cache.has(id) && !this.running.has(id)) {
      this.load(id, priority, loader).catch(() => {});
    }
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const resourceLoader = new ResourceLoader(4);

export async function loadWithPriority<T>(
  id: string,
  priority: Priority,
  loader: () => Promise<T>,
): Promise<T> {
  return resourceLoader.load(id, priority, loader);
}

export function prefetchResource<T>(id: string, priority: Priority, loader: () => Promise<T>): void {
  resourceLoader.preload(id, priority, loader);
}

export async function concurrentAll<T>(
  tasks: Array<() => Promise<T>>,
  maxConcurrent: number = 4,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  let index = 0;

  async function execute(task: () => Promise<T>, pos: number) {
    results[pos] = await task();
  }

  for (const task of tasks) {
    const pos = index++;
    const p = execute(task, pos);
    executing.push(p);

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
      for (let i = executing.length - 1; i >= 0; i--) {
        try {
          await Promise.resolve(executing[i]);
          executing.splice(i, 1);
          break;
        } catch {
          executing.splice(i, 1);
          break;
        }
      }
    }
  }

  await Promise.all(executing);
  return results;
}
