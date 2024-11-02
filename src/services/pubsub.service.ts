import { Subject, interval, Subscription } from 'rxjs';

class PubSubService {
    private subjects: { [key: string]: Subject<any> } = {};
    private dataGenerators: { [key: string]: Subscription } = {};

    // Create a new subject for a given key
    createSubject(key: string) {
        if (!this.subjects[key]) {
            this.subjects[key] = new Subject<any>();
        }
    }

    // Publish an event to a subject
    publish(key: string, data: any) {
        if (this.subjects[key]) {
            this.subjects[key].next(data);
        }
    }

    // Subscribe to a subject
    subscribe(key: string, callback: (data: any) => void) {
        if (!this.subjects[key]) {
            this.createSubject(key);
        }
        return this.subjects[key].subscribe(callback);
    }

    // Generate random data based on type
    private generateRandomData(type: 'number' | 'string' | 'boolean' = 'number') {
        switch (type) {
            case 'number':
                return Math.random() * 100;
            case 'string':
                return Math.random().toString(36).substring(7);
            case 'boolean':
                return Math.random() > 0.5;
            default:
                return Math.random();
        }
    }

    // Start sending random data to a subject
    startRandomData(key: string, options: {
        interval?: number,
        dataType?: 'number' | 'string' | 'boolean',
        generator?: () => any
    } = {}) {
        if (!this.subjects[key]) {
            this.createSubject(key);
        }

        // Stop any existing generator for this key
        this.stopRandomData(key);

        // Start new interval
        this.dataGenerators[key] = interval(options.interval || 1000)
            .subscribe(() => {
                const randomData = options.generator 
                    ? options.generator() 
                    : this.generateRandomData(options.dataType);
                this.publish(key, randomData);
            });
    }

    // Stop sending random data
    stopRandomData(key: string) {
        if (this.dataGenerators[key]) {
            this.dataGenerators[key].unsubscribe();
            delete this.dataGenerators[key];
        }
    }
}

const pubSubService = new PubSubService();
export default pubSubService;