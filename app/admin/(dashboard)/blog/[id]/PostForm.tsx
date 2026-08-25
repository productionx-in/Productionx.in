"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Editor } from "./Editor";
import { updateBlogPost, deleteBlogPost } from "../../../actions";
import { uploadBlogMedia } from "../../../lib/upload";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  cover_video_url: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  status: string;
};

export function PostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [html, setHtml] = useState(post.content_html);
  const [cover, setCover] = useState(post.cover_image_url ?? "");
  const [video, setVideo] = useState(post.cover_video_url ?? "");
  const [tags, setTags] = useState((post.tags || []).join(", "));
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(post.seo_description ?? "");
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      setCover(await uploadBlogMedia(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  }

  async function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      setVideo(await uploadBlogMedia(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
    }
  }

  function save(status?: "draft" | "published") {
    start(async () => {
      await updateBlogPost(post.id, {
        title,
        slug,
        excerpt,
        content_html: html,
        cover_image_url: cover || undefined,
        cover_video_url: video || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        seo_title: seoTitle,
        seo_description: seoDesc,
        ...(status ? { status } : {}),
      });
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: 20, fontWeight: 700, background: "transparent", border: "none", padding: 0, width: "100%" }}
            placeholder="Post title"
          />
          <p className="note">/blog/{slug}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className={`badge badge--${post.status}`}>{post.status}</span>
          <button className="btn btn--ghost" disabled={pending} onClick={() => save()}>
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button className="btn btn--mint" disabled={pending} onClick={() => save("published")}>
            Publish
          </button>
          <button
            className="btn btn--danger"
            onClick={() => {
              if (confirm("Delete this post permanently?")) {
                start(async () => {
                  await deleteBlogPost(post.id);
                  router.push("/admin/blog");
                });
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label>URL slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="field">
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="field">
          <label>Cover image</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://… or upload" style={{ flex: 1 }} />
            <button
              type="button"
              className="btn btn--ghost"
              disabled={uploadingCover}
              onClick={() => coverFileRef.current?.click()}
            >
              {uploadingCover ? "…" : "Upload"}
            </button>
            <input ref={coverFileRef} type="file" accept="image/*" hidden onChange={onPickCover} />
          </div>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" style={{ marginTop: 8, maxHeight: 90, borderRadius: 6 }} />
          )}
        </div>
        <div className="field">
          <label>Cover video (optional, shown instead of the image)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://…mp4 or upload" style={{ flex: 1 }} />
            <button
              type="button"
              className="btn btn--ghost"
              disabled={uploadingVideo}
              onClick={() => videoFileRef.current?.click()}
            >
              {uploadingVideo ? "…" : "Upload"}
            </button>
            <input ref={videoFileRef} type="file" accept="video/*" hidden onChange={onPickVideo} />
          </div>
        </div>
        <div className="field field--full">
          <label>Excerpt (shows on the blog index)</label>
          <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="field">
          <label>SEO title (optional, defaults to post title)</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>SEO description (optional, defaults to excerpt)</label>
          <input value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
        </div>
      </div>

      <Editor content={html} onChange={setHtml} />

      <p className="note" style={{ marginTop: 10 }}>
        {savedAt ? `Saved at ${savedAt}.` : "Changes save when you click Save draft or Publish."}{" "}
        <Link href="/admin/blog">← back to all posts</Link>
      </p>
    </>
  );
}
