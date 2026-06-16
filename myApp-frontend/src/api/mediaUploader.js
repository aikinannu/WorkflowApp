import secureStorage from '../utils/secureStorage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const STORAGE_TOKEN_KEY = 'gdwb_token';

const getToken = async () => {
  try {
    return await secureStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

async function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return global.btoa(binary);
}

async function uriToBase64(file) {
  const { uri } = file;
  if (!uri) throw new Error('missing_uri');

  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const buffer = await res.arrayBuffer();
    return arrayBufferToBase64(buffer);
  }

  // native (expo) - use FileSystem to read base64
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return b64;
  } catch {
    // fallback: fetch + arrayBuffer
    const res = await fetch(uri);
    const buffer = await res.arrayBuffer();
    return arrayBufferToBase64(buffer);
  }
}

export async function uploadFile(file, tenantId) {
  const token = await getToken();
  const filename = file.name || (file.uri ? file.uri.split('/').pop() : 'upload.bin');
  // Try multipart/form-data upload first (preferred)
  try {
    const form = new FormData();
    form.append('tenant_id', tenantId);

    if (Platform.OS === 'web' && file.file instanceof File) {
      form.append('file', file.file, filename);
      if (file.width) form.append('width', String(file.width));
      if (file.height) form.append('height', String(file.height));
      if (file.duration) form.append('duration', String(file.duration));
    } else if (Platform.OS === 'web' && file.uri) {
      // fetch blob from object URL
      const res = await fetch(file.uri);
      const blob = await res.blob();
      form.append('file', blob, filename);
      if (file.width) form.append('width', String(file.width));
      if (file.height) form.append('height', String(file.height));
      if (file.duration) form.append('duration', String(file.duration));
    } else if (file.uri) {
      // React Native: use { uri, name, type }
      form.append('file', {
        uri: file.uri,
        name: filename,
        type: file.type || 'application/octet-stream',
      });
      if (file.width) form.append('width', String(file.width));
      if (file.height) form.append('height', String(file.height));
      if (file.duration) form.append('duration', String(file.duration));
    } else {
      throw new Error('no_file_to_upload');
    }

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!resp.ok) {
      // fall back to base64 path if server rejects multipart
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error || err?.message || resp.statusText || 'multipart_failed');
    }

    const json = await resp.json();
    return json.media?.[0] ?? json.media ?? json;
  } catch {
    // Fallback: legacy base64 JSON upload
    try {
      const content = await uriToBase64(file);
      const body = { filename, content, tenant_id: tenantId };
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || resp.statusText || 'upload_failed');
      }

      const json = await resp.json();
      return json.media?.[0] ?? json.media ?? json;
    } catch (err2) {
      throw err2;
    }
  }
}

export async function uploadFiles(files = [], tenantId) {
  const results = [];
  for (const f of files) {
    const res = await uploadFile(f, tenantId);
    results.push(res);
  }
  return results;
}
