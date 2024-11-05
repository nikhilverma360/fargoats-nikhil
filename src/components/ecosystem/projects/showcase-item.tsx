import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ShowcaseItemProps {
    name: string;
    description: string;
    logo: string;
    badges: string[];
}

const badgeVariants = ['default', 'secondary', 'destructive', 'outline'] as const;

export default function ShowcaseItem({ name, description, logo, badges }: ShowcaseItemProps) {
    return (
        <div className="flex flex-col space-y-4 bg-card rounded-lg shadow-sm overflow-hidden m-2">
            <div className="relative w-full h-48">
                <Image src={logo} alt={`${name} logo`} layout="fill" objectFit="cover" />
            </div>
            <div className="flex flex-col space-y-2 p-4">
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-muted-foreground">{description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {badges.map((badge, index) => (
                        <Badge key={index} variant={badgeVariants[index % badgeVariants.length]}>
                            {badge}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
