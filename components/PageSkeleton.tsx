"use client";

import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    title: string;
    description: string;
}>;

export default function PageSkeleton({ title, description, children }: Props) {
    return (
        <div className="max-w-screen-lg mx-auto px-4">
            <header>
                <h1 className="text-2xl font-bold">{title}</h1>
                <h2 className="mt-2">{description}</h2>
                <hr className="my-4" />
            </header>
            <main>{children}</main>
        </div>
    );
}
