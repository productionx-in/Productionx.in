"use client";

import { supabaseBrowser } from "../../lib/supabase/client";

/**
 * Uploads a file straight from the browser to the blog-media bucket and
 * returns its public URL. The bucket is public-read; only signed-in admins
 * can write to it (storage RLS checks admin_users, same as every other
 * table), so this can only be called from inside the authed dashboard.
 */
export async function uploadBlogMedia(file: File): Promise<string> {
  const supabase = supabaseBrowser();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("blog-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
  return data.publicUrl;
}
