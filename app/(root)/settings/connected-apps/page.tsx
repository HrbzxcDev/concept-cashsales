export const metadata = {
  title: 'Settings · Connected Apps'
};

export default function ConnectedAppsSettingsPage() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-semibold">Connected Apps</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage integrations, API tokens, and external connections. Use this area to list and configure connected services.
      </p>
    </div>
  );
}

