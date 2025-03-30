"use client";

export function Button({ children, ...props }: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
    return (
        <button
            className="rounded-md bg-blue-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            {...props}
        >
            {children}
        </button>
    );
}
