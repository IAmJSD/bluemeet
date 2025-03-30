"use client";

import { state } from "@/lib/state";
import { useAtomsFromStructure, setStructureFromObject } from "atomtree";
import { useState, useId, useRef, useEffect } from "react";
import { Button } from "./Button";
import Link from "next/link";
import Spinner from "./Spinner";

function ConsentScreen() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        fetch("/api/bluesky", {
            method: "POST",
            body: JSON.stringify(input),
        }).then(async (res) => {
            if (res.ok) {
                window.location.href = await res.text();
            } else {
                setLoading(false);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <p>By logging in, you agree you are over 18 years of age. This service is not for minors.</p>
            <input
                type="text"
                className="w-full rounded-md border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 my-4"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your Bluesky handle"
            />
            <Button type="submit" disabled={loading || input.length === 0}>
                Login
            </Button>
        </form>
    );
}

function LoginButton() {
    const dialogRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            <dialog ref={dialogRef} className="fixed inset-0 z-50" onClick={() => dialogRef.current?.close()}>
                <div className="fixed inset-0 bg-black bg-opacity-50" />
                <div className="fixed inset-0 flex items-center justify-center">
                    <div
                        className="bg-white dark:bg-gray-900 dark:text-white p-4 mx-4 rounded-lg max-w-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ConsentScreen />
                    </div>
                </div>
            </dialog>
            <button onClick={() => dialogRef.current?.showModal()}>Login</button>
        </>
    );
}

function UserMenu({ handle, avatar }: { handle: string; avatar: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const id = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleEscape);

        const handleClickOutside = (e: MouseEvent) => {
            if (
                e.target instanceof HTMLElement &&
                !e.target.closest(`#${CSS.escape(id)}`) &&
                !buttonRef.current?.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("keydown", handleEscape);
            window.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div>
            <button ref={buttonRef} onClick={() => setIsOpen((o) => !o)} aria-expanded={isOpen} aria-controls={id}>
                {avatar ? <img src={avatar} aria-hidden={true} className="w-8 h-8 rounded-full inline-block" /> : null}
                <span className="ml-2">{handle}</span>
            </button>
            <div
                id={id}
                className={`absolute right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md mt-2 mr-2 ${isOpen ? "" : "hidden"}`}
            >
                <button
                    onClick={() => {
                        setIsOpen(false);
                        fetch("/api/user", {
                            method: "DELETE",
                        }).then(() => {
                            setStructureFromObject(state.users, {
                                application: null,
                                bluesky: null,
                            });
                        });
                    }}
                    className="text-left mt-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
                >
                    Logout
                </button>
                <Link href="/location">
                    <div
                        onClick={() => setIsOpen(false)}
                        className="text-left my-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
                    >
                        Set Location
                    </div>
                </Link>
            </div>
        </div>
    );
}

function UserSidebarEntry() {
    const { application, bluesky } = useAtomsFromStructure(state.users);
    if (application === undefined) {
        // Page hasn't loaded enough to know if the user is logged in.
        return <Spinner small={true} />;
    }

    if (!application) {
        // User is not logged in. Show the login link. This is intentionally an anchor tag
        // and not a Next link because we want to avoid the client-side behaviours since they don't matter.
        return <LoginButton />;
    }

    if (!bluesky) {
        // Show a loading spinner whilst the bluesky profile is loading.
        return <Spinner small={true} />;
    }

    return <UserMenu handle={bluesky.handle} avatar={bluesky.avatar} />;
}

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4">
            <div className="flex items-center">
                <Link href="/">Bluemeet</Link>
            </div>
            <UserSidebarEntry />
        </nav>
    );
}
