-- Modify corriges table to support multiple images
ALTER TABLE corriges 
  DROP COLUMN image_url,
  ADD COLUMN image_urls text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN corriges.image_urls IS 'Array of image URLs for the corrigé (up to 50 images)';