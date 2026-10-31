ALTER TABLE products ADD COLUMN media JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE products ADD CONSTRAINT products_media_array CHECK (jsonb_typeof(media) = 'array' AND jsonb_array_length(media) <= 8);
