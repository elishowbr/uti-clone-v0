import { redirect } from "next/navigation";

// This route has been superseded by /<hospital_id>/dashboard.
// Authenticated users are now routed through /hospitals first.
export default function LegacyDashboardRedirect() {
    redirect("/hospitals");
}
