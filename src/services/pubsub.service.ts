import { Subject } from 'rxjs';
import { ChartData, dataService } from './subservice';

export class PubSubService {
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
        }, 5000); // Poll every 5 seconds
    }

    subscribeToChartData(callback: (data: ChartData) => void) {
        return this.chartDataSubject.subscribe(callback);
    }
}

export const pubSubService = new PubSubService();