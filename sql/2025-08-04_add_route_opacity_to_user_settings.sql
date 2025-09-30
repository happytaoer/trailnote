-- Add route_opacity field to user_settings table
-- This field will store the user's default route opacity preference

ALTER TABLE user_settings 
ADD COLUMN route_opacity VARCHAR(3) DEFAULT '1.0' NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN user_settings.route_opacity IS 'User''s default route opacity value between 0.0 (transparent) and 1.0 (opaque)';
