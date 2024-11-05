import React from 'react';
import { PubSubService, PubSubContext } from '@/services/pubsub.service';

const pubSubService = new PubSubService();

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
    return (
        <PubSubContext.Provider value={pubSubService}>
            <Component {...pageProps} />
        </PubSubContext.Provider>
    );
}

export default MyApp;