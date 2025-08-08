"use client";

export function DebugEnv() {
  return (
    <div className="p-4 border rounded-lg bg-muted">
      <h3 className="font-semibold mb-2">Environment Variables Debug:</h3>
      <div className="space-y-1 text-sm">
        <div>
          NEXT_PUBLIC_API_BASE_URL:{" "}
          {process.env.NEXT_PUBLIC_API_BASE_URL || "NOT SET"}
        </div>
        <div>
          NEXT_PUBLIC_DB_CODE: {process.env.NEXT_PUBLIC_DB_CODE || "NOT SET"}
        </div>
        <div>
          NEXT_PUBLIC_API_BASE_URL:{" "}
          {process.env.NEXT_PUBLIC_API_BASE_URL || "NOT SET"}
        </div>
        <div>
          NEXT_PUBLIC_DB_CODE: {process.env.NEXT_PUBLIC_DB_CODE || "NOT SET"}
        </div>
      </div>
    </div>
  );
}
