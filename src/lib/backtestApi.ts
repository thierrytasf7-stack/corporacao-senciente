import { trpc } from '@/utils/trpc';

export const backtestApi = trpc.proxy('backtest');