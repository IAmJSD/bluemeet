"use client";

import PageSkeleton from "@/components/PageSkeleton";
import Spinner from "@/components/Spinner";
import { state } from "@/lib/state";
import { redirect } from "next/navigation";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const LocationSelector = dynamic(
    () => import("./LocationSelector").then((mod) => mod.default),
    { ssr: false },
);

function SuspensedLocationSelector({ location }: { location: { latitude: number; longitude: number } | null }) {
    return <Suspense fallback={<Spinner small={false} />}>
        <LocationSelector location={location} />
    </Suspense>;
}

export default function LocationPage() {
    const applicationUser = state.users.application.use();

    useEffect(() => {
        if (applicationUser === null) {
            // Redirect to the root.
            redirect("/");
        }
    }, [applicationUser]);

    return (
        <PageSkeleton title="Location" description="Set your location on the map so other users can find you.">
            {applicationUser ? <SuspensedLocationSelector location={applicationUser.location} /> : <Spinner small={false} />}
        </PageSkeleton>
    );
}
