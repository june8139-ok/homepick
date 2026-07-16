import { supabase } from "./supabase";

export async function uploadImage(file: File, folder: string) {
  const extension = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("apartments")
    .upload(path, file);

  if (error) throw error;

  return supabase.storage.from("apartments").getPublicUrl(path).data.publicUrl;
}