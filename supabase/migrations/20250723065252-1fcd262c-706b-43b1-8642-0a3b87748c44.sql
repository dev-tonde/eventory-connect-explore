-- Fix remaining function search_path issues
-- Update any remaining functions that don't have search_path set

-- Check which functions need fixing
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%handle%' OR proname LIKE '%generate%' OR proname LIKE '%update%' OR proname LIKE '%set%';