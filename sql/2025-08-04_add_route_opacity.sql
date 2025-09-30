-- Add opacity field to routes table
ALTER TABLE routes ADD COLUMN route_opacity DECIMAL(3,2) DEFAULT 1.0;

-- Add constraint to ensure opacity is between 0 and 1
ALTER TABLE routes ADD CONSTRAINT check_route_opacity 
CHECK (route_opacity >= 0.0 AND route_opacity <= 1.0);

-- Add comment for the new field
COMMENT ON COLUMN routes.route_opacity IS 'Route line opacity value between 0.0 (transparent) and 1.0 (opaque)';
