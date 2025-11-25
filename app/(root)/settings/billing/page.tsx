export const metadata = {
  title: 'Settings · Billing'
};

export default function BillingSettingsPage() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-semibold">Billing</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        View invoices, payment methods, and subscription details. Populate this section with billing-specific UI.
      </p>
    </div>
  );
}

