# Supabase Storage Setup for Avatars

## 📦 Create Storage Bucket

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New Bucket**

### Step 2: Create Avatars Bucket
- **Name**: `avatars`
- **Public bucket**: ✅ **YES** (Enable this)
- **File size limit**: 5 MB (recommended)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

Click **Create Bucket**

### Step 3: Set Up Storage Policies

Go to **Storage** → **Policies** → Select `avatars` bucket

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

#### Policy 2: Authenticated Users Can Upload
```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Users Can Update Own Avatars
```sql
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users Can Delete Own Avatars
```sql
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 4: Verify Setup

Test the bucket by uploading a test image:
1. Go to Storage → avatars
2. Click Upload File
3. Upload any image
4. Verify you can see and access it

## 📱 Mobile App Integration

The mobile app is already configured to:
- Upload avatars to `avatars/{userId}/{filename}`
- Display avatar URLs from Supabase Storage
- Handle image picker for profile photos
- Compress images before upload

## 🔐 Security Notes

- Files are stored in user-specific folders: `avatars/{userId}/`
- Only authenticated users can upload
- Users can only modify their own files
- Public read access allows avatars to be displayed everywhere
- File size limit prevents abuse

## 🎨 Image Guidelines

**Recommended specifications:**
- Format: JPEG, PNG, or WebP
- Size: 400x400px to 1000x1000px
- Max file size: 5 MB
- Aspect ratio: 1:1 (square)

The app will automatically:
- Resize images to 800x800px
- Compress to reduce file size
- Convert to JPEG format

## 🧪 Testing

After setup, test with these steps:

1. **Sign up a new user** in the mobile app
2. **Go to Profile screen**
3. **Tap on avatar** to upload
4. **Select an image** from gallery
5. **Verify upload** completes successfully
6. **Check Supabase Storage** to see the file
7. **Refresh profile** to see the new avatar

## 🐛 Troubleshooting

### Issue: "Storage bucket not found"
- **Solution**: Ensure bucket name is exactly `avatars`

### Issue: "Permission denied"
- **Solution**: Verify all 4 policies are created correctly

### Issue: "File too large"
- **Solution**: Check file size limit in bucket settings

### Issue: "Invalid file type"
- **Solution**: Ensure MIME types are configured correctly

## 📊 Monitoring

Monitor storage usage:
1. Dashboard → Storage → avatars
2. View file count and total size
3. Set up alerts for storage limits

## 🔄 Cleanup Old Avatars

When users update avatars, old files remain. Set up a cleanup function:

```sql
-- Function to delete old avatar when new one is uploaded
CREATE OR REPLACE FUNCTION delete_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old avatar file from storage
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
    -- Extract file path from URL and delete
    -- This requires storage.objects access
    PERFORM storage.delete(OLD.avatar_url);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on users table
CREATE TRIGGER cleanup_old_avatar
BEFORE UPDATE OF avatar_url ON public.users
FOR EACH ROW
EXECUTE FUNCTION delete_old_avatar();
```

---

**Setup Complete!** Your avatar storage is now ready for production use.
