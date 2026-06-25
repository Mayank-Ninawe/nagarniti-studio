import PageLayout from "../components/layout/PageLayout";
import DemoSeedPanel from "../demo/DemoSeedPanel";
import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: "var(--content-wide)" }}>
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-divider">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin Tools
            </h1>
            <p className="text-gray-500 mt-1">
              Developer options, database seeding utilities, and system status dashboards.
            </p>
          </div>
        </div>

        {/* Admin Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <DemoSeedPanel isAdminUser={true} />
          </div>
          
          <div className="card border border-divider bg-gray-50/20 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">System Roles</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                As a supervisor or administrator, you have permission to access the seeding panel. Real-time updates and notifications are managed automatically.
              </p>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              ROLE: Administrator • ENVIRONMENT: {import.meta.env.MODE}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
