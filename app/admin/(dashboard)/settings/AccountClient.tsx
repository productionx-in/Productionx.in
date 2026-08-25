"use client";

import { useState, useTransition } from "react";
import { supabaseBrowser } from "../../../lib/supabase/client";
import { updateOwnName } from "../../actions";

export function AccountForm({ email, fullName }: { email: string; fullName: string | null }) {
  const [name, setName] = useState(fullName ?? "");
  const [namePending, startName] = useTransition();
  const [nameSaved, setNameSaved] = useState(false);

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw1.length < 8) {
      setPwMsg("Use at least 8 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setPwMsg("Passwords don't match.");
      return;
    }
    setPwBusy(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setPwBusy(false);
    if (error) {
      setPwMsg(error.message);
      return;
    }
    setPw1("");
    setPw2("");
    setPwMsg("Password updated.");
  }

  return (
    <div className="panel">
      <h2>Your account</h2>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label>Email</label>
          <input value={email} disabled />
        </div>
        <div className="field">
          <label>Display name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
            <button
              type="button"
              className="btn btn--ghost"
              disabled={namePending}
              onClick={() =>
                startName(async () => {
                  await updateOwnName(name);
                  setNameSaved(true);
                  setTimeout(() => setNameSaved(false), 2000);
                })
              }
            >
              {namePending ? "…" : "Save"}
            </button>
          </div>
          {nameSaved && <span className="note">Saved.</span>}
        </div>
      </div>

      <form onSubmit={changePassword} className="form-grid">
        <div className="field">
          <label>New password</label>
          <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} minLength={8} />
        </div>
        <div className="field">
          <label>Confirm new password</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} />
        </div>
        <div className="field--full">
          <button className="btn" disabled={pwBusy}>
            {pwBusy ? "Updating…" : "Change password"}
          </button>
          {pwMsg && <span className="note" style={{ marginLeft: 12 }}>{pwMsg}</span>}
        </div>
      </form>
    </div>
  );
}
