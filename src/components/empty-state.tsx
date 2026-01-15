
import Image from "next/image";


interface Props {
    title: string;
    description: string;
    image?: string;
    action?: React.ReactNode;
};


export const EmptyState = ({
    title,
    description,
    image = "/empty.svg",
    action
}: Props) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Image
                src={image}
                alt="État vide"
                width={240}
                height={240}
                className="opacity-50"
            />
            <div className="flex flex-col gap-y-4 max-w-md mx-auto text-center mt-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
                {action && (
                    <div className="mt-2">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}