# Large File Upload Solution for Vercel

This document explains how to handle large audio file uploads (40MB+) in production on Vercel.

## Problem

Vercel has platform limitations that prevent large file uploads through server actions:
- **Request body limit**: 4.5MB (regardless of Next.js config)
- **Function timeout**: 10-60 seconds depending on plan
- Files larger than 4.5MB fail in production even with `bodySizeLimit: '50mb'` in Next.js config

## Solution Overview

We've implemented a **hybrid upload strategy**:
1. **Small files (≤4MB)**: Use existing server actions
2. **Large files (>4MB)**: Direct client-to-Cloudinary upload

## Implementation

### 1. Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "app/actions/upload-audio.ts": {
      "maxDuration": 60
    },
    "app/api/**": {
      "maxDuration": 60
    }
  },
  "regions": ["sin1"],
  "framework": "nextjs"
}
```

### 2. Direct Upload Server Actions (`app/actions/upload-audio-direct.ts`)
- `getUploadSignature()`: Provides Cloudinary configuration
- `handleUploadComplete()`: Processes successful uploads

### 3. Client-Side Upload Hook (`hooks/use-cloudinary-upload.ts`)
- Direct XMLHttpRequest to Cloudinary
- Progress tracking
- Error handling
- 5-minute timeout for large files

### 4. Updated Form Hook (`app/soal/create/hooks/use-soal-form.ts`)
- Automatic file size detection
- Routes to appropriate upload method
- Progress indicator integration

### 5. Progress Component (`components/ui/upload-progress.tsx`)
- Visual upload progress
- File name and size display
- Loading states

## File Size Thresholds

- **≤4MB**: Server action upload (fast, through Vercel)
- **>4MB**: Direct Cloudinary upload (bypasses Vercel limits)

## Usage

The implementation is automatic - no changes needed in your forms:

```typescript
// This automatically chooses the right upload method
const handleUpload = async (file: File) => {
  const url = await handleAudioFileUpload(file)
  // Large files go direct to Cloudinary
  // Small files use server actions
}
```

## Benefits

1. **No file size limits** - Can handle any size Cloudinary supports
2. **Progress tracking** - Visual feedback for large uploads
3. **Backward compatible** - Existing small file uploads unchanged
4. **Error resilient** - Proper error handling and timeouts
5. **Cost effective** - Uses direct upload, reducing Vercel function usage

## Cloudinary Configuration

Ensure your Cloudinary settings allow:
- Upload preset: `ml_default`
- Folder: `aquarium-audio`
- Resource type: `video` (for audio files)
- File size limits set appropriately

## Testing

1. **Development**: Test both small and large files locally
2. **Staging**: Deploy and test 40MB+ files in Vercel staging
3. **Production**: Monitor upload success rates and error logs

## Monitoring

Monitor these metrics:
- Upload success/failure rates by file size
- Upload duration for large files
- Cloudinary bandwidth usage
- User experience feedback

## Troubleshooting

### Common Issues:

1. **"Upload failed with status: 413"**
   - File too large for server action
   - Solution: Lower threshold in `use-soal-form.ts`

2. **"Network error during upload"**
   - Network connectivity issues
   - Solution: Implement retry logic

3. **"Upload timed out"**
   - File too large or slow connection
   - Solution: Increase timeout in `use-cloudinary-upload.ts`

### Debug Steps:

1. Check browser network tab for failed requests
2. Verify Cloudinary upload preset settings
3. Test with different file sizes to find threshold
4. Check Vercel function logs for server-side errors

## Future Improvements

1. **Resumable uploads** for very large files
2. **Chunked uploads** for better reliability
3. **Background processing** for post-upload tasks
4. **Compression** before upload for audio files