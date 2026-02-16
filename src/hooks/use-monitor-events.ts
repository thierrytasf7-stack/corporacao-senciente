import { useEffect, useState } from 'react';
import { useStore } from '../stores/store';
import { MonitorEvent } from '../types/monitor-events';

export function useMonitorEvents() {
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { monitorStore } = useStore();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await monitorStore.getEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [monitorStore]);

  return { events, loading, error };
}
