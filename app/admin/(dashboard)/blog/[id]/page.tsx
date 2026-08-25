import { notFound } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabase/server";
import { PostForm } from "./PostForm";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();
  return <PostForm post={post} />;
}
