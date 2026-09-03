import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import path from 'path';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase Storage credentials missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment variables.'
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const BUCKET = 'books';

export async function createSignedUploadUrl(
  originalFilename: string
): Promise<{ signedUrl: string; token: string; path: string; publicUrl: string; filename: string }> {
  const supabase = getSupabase();
  const ext = path.extname(originalFilename) || '.pdf';
  const filename = `${crypto.randomUUID()}${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(filename);

  if (error || !data) {
    console.error('Failed to create signed upload URL:', error);
    throw new Error(error?.message || 'Failed to create signed upload URL');
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicData.publicUrl,
    filename,
  };
}

export async function saveFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<string> {
  const supabase = getSupabase();
  const ext = path.extname(originalFilename) || '.pdf';
  const filename = `${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, {
      contentType: mimeType || 'application/pdf',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  if (fileUrl.startsWith('/uploads/')) return; // ignore legacy local uploads

  try {
    const supabase = getSupabase();
    // Extract filename from URL (e.g. https://.../books/uuid.pdf)
    const urlWithoutQuery = fileUrl.split('?')[0];
    const parts = urlWithoutQuery.split('/');
    const filename = parts[parts.length - 1];
    if (!filename) return;

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filename]);

    if (error) {
      console.warn('Could not delete Supabase file:', error);
    }
  } catch (error) {
    console.warn('Supabase delete error:', error);
  }
}