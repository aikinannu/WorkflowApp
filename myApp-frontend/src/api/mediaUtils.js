import { Platform } from 'react-native';

// Enrich media asset with width, height and duration where possible.
export async function enrichAssetMetadata(asset) {
  if (!asset) return asset;
  let width = asset.width || asset.metadata?.width || null;
  let height = asset.height || asset.metadata?.height || null;
  let duration = asset.duration || asset.metadata?.duration || null;

  // If already have useful metadata, return early
  if ((width && height) || duration) {
    return { ...asset, width, height, duration };
  }

  try {
    if (Platform.OS === 'web') {
      // Use HTML5 video element to read metadata for video URIs
      const isVideo = (asset.type || '').toLowerCase().includes('video') || /(mp4|mov|webm|ogg)$/i.test(asset.uri || asset.name || '');
      if (isVideo && asset.uri) {
        const meta = await new Promise((resolve, reject) => {
          try {
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.src = asset.uri;
            v.onloadedmetadata = () => {
              resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration });
              try { URL.revokeObjectURL(v.src); } catch {}
            };
            v.onerror = (e) => reject(e);
          } catch (err) {
            reject(err);
          }
        });
        width = width || meta.width;
        height = height || meta.height;
        duration = duration || meta.duration;
      }
    } else {
      // Native: try expo-media-library to get asset info (width/height/duration)
      const MediaLibrary = await import('expo-media-library');
      let info = null;
      try {
        // asset.id may be an assetLocalId on native pickers
        const assetId = asset.id || asset.assetId || null;
        if (assetId) {
          info = await MediaLibrary.getAssetInfoAsync(assetId);
        } else if (asset.uri) {
          // Some platforms accept uri as id
          info = await MediaLibrary.getAssetInfoAsync(asset.uri);
        }
      } catch {
        info = null;
      }
      if (info) {
        width = width || info.width;
        height = height || info.height;
        duration = duration || info.duration;
      }
    }
  } catch {
    // best-effort only
  }

  return { ...asset, width, height, duration };
}

export default enrichAssetMetadata;
