export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PaidAdsPage() {
  return (
    <>
      <h1>Paid Ads</h1>
      <p className="admin-main__sub">Meta Ads and Google Ads, in one platform-neutral model — not built yet, but the schema is ready.</p>

      <div className="panel">
        <h2>Meta Ads</h2>
        <p className="note">
          Not connected — the current Meta token has <code>read_insights</code> and <code>instagram_manage_insights</code> (which is
          what powers Organic), but not <code>ads_read</code>. That permission needs to be added to the token before campaign/spend
          data can be pulled. No API calls are being attempted here yet.
        </p>
      </div>

      <div className="panel">
        <h2>Google Ads</h2>
        <p className="note">Not connected — needs a Google Ads API developer token and OAuth credentials, not yet configured.</p>
      </div>

      <div className="panel">
        <h2>What this will show, once either is connected</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Ad Set</th>
              <th>Ad</th>
              <th>Spend</th>
              <th>Reach</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>Leads</th>
              <th>Cost/lead</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={11} className="empty-state" style={{ borderRadius: 0 }}>
                No campaigns yet — the database (ad_accounts, ad_campaigns, ad_sets, ads, ad_metric_snapshots) is
                platform-neutral, so Meta Ads and Google Ads populate the same tables and this same table.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
