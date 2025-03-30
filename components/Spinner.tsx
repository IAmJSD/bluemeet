"use client";

type Props = {
    small: boolean;
};

export default function Spinner({ small }: Props) {
    return (
        <div
            className={`${small ? "w-4 h-4" : "w-16 h-16"} border-2 border-t-transparent border-b-transparent border-r-transparent border-l-current rounded-full animate-spin`}
            aria-label="Loading..."
        />
    );
}
