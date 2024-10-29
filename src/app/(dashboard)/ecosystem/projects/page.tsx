'use client';
import ShowcaseItem from '@/components/ecosystem/projects/showcase-item';

const showcaseItems = [
    {
        name: 'Project 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        logo: 'https://picsum.photos/id/237/500/300',
        website: 'https://example.com',
        badges: ['badge1', 'badge2', 'badge3'],
    },
    {
        name: 'Project 2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        logo: 'https://picsum.photos/id/238/500/300',
        website: 'https://example.com',
        badges: ['badge1', 'badge2', 'badge3'],
    },
    {
        name: 'Project 3',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        logo: 'https://picsum.photos/id/239/500/300',
        website: 'https://example.com',
        badges: ['badge1', 'badge2', 'badge3'],
    },
    {
        name: 'Project 4',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        logo: 'https://picsum.photos/id/240/500/300',
        website: 'https://example.com',
        badges: ['badge1', 'badge2', 'badge3'],
    },
    {
        name: 'Project 5',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        logo: 'https://picsum.photos/id/241/500/300',
        website: 'https://example.com',
        badges: ['badge1', 'badge2', 'badge3'],
    },
];
export default function Page() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            {showcaseItems.map((item) => (
                <ShowcaseItem {...item} />
            ))}
        </div>
    );
}
