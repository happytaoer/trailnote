-- Add route_color and route_width fields to user_settings table
-- These fields will store the user's default route preferences

ALTER TABLE user_settings 
ADD COLUMN route_color VARCHAR(7) DEFAULT '#3887be' NOT NULL,
ADD COLUMN route_width VARCHAR(2) DEFAULT '3' NOT NULL;

-- Add comments to document the fields
COMMENT ON COLUMN user_settings.route_color IS 'User''s default route color in hex format (e.g., #3887be)';
COMMENT ON COLUMN user_settings.route_width IS 'User''s default route width in pixels (1-10)';
