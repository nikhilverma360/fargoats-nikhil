import { Subject } from 'rxjs';

class PubSubService {
    private subjects: { [key: string]: Subject<any> } = {};

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
}

const pubSubService = new PubSubService();
export default pubSubService;