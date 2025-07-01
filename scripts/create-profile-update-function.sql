-- Create a function to update profile images
CREATE OR REPLACE FUNCTION update_provider_profile_image(
  p_user_id TEXT,
  p_profile_image TEXT
)
RETURNS TABLE(id UUID, profile_image TEXT, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to update by user_id first
  UPDATE providers 
  SET profile_image = p_profile_image, updated_at = NOW()
  WHERE user_id::TEXT = p_user_id;
  
  -- If no rows affected, try by id
  IF NOT FOUND THEN
    UPDATE providers 
    SET profile_image = p_profile_image, updated_at = NOW()
    WHERE id::TEXT = p_user_id;
  END IF;
  
  -- Return the updated row
  RETURN QUERY
  SELECT p.id, p.profile_image, p.updated_at
  FROM providers p
  WHERE p.user_id::TEXT = p_user_id OR p.id::TEXT = p_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_provider_profile_image TO authenticated;
GRANT EXECUTE ON FUNCTION update_provider_profile_image TO service_role;
