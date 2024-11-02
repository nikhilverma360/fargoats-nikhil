import { Subject } from 'rxjs';
import { ChartData, dataService } from './subservice';
import { createContext } from 'react';

export class PubSubService {
    static startRandomData(arg0: string, arg1: { interval: number; dataType: string; generator: () => { timestamp: string; tvl: number; dau: number; transactions: number; }; }) {
        throw new Error('Method not implemented.');
    }
    static stopRandomData(arg0: string) {
        throw new Error('Method not implemented.');
    }
    private subjects: Map<string, Subject<any>> = new Map();
    private chartDataSubject: Subject<ChartData> = new Subject<ChartData>();

    constructor() {
        this.startPolling();
    }

    private async startPolling() {
        setInterval(async () => {
            try {
                const data = await dataService.fetchChartData();
                this.chartDataSubject.next(data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        }, 5000);
    }

    subscribeToChartData(callback: (data: ChartData) => void) {
        return this.chartDataSubject.subscribe(callback);
    }

    subscribe<T>(channel: string, callback: (data: T) => void) {
        if (!this.subjects.has(channel)) {
            this.subjects.set(channel, new Subject<T>());
        }
        return this.subjects.get(channel)!.subscribe(callback);
    }

    publish<T>(channel: string, data: T) {
        if (!this.subjects.has(channel)) {
            this.subjects.set(channel, new Subject<T>());
        }
        this.subjects.get(channel)!.next(data);
    }
}

export const PubSubContext = createContext<PubSubService>(new PubSubService());
export const pubSubService = new PubSubService();