-- Inspect likes with missing or invalid user_id
SELECT id, user_id, post_id, comment_id, created_at
FROM public.likes
WHERE user_id IS NULL
   OR user_id = ''
   OR user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC;

-- DELETE problematic rows (uncomment to run)
-- DELETE FROM public.likes
-- WHERE user_id IS NULL
--    OR user_id = ''
--    OR user_id = '00000000-0000-0000-0000-000000000000';

-- Optional: show current like counts per post
SELECT post_id, count(*) AS like_count
FROM public.likes
WHERE post_id IS NOT NULL
GROUP BY post_id
ORDER BY like_count DESC;

-- Optional: show current like counts per comment
SELECT comment_id, count(*) AS like_count
FROM public.likes
WHERE comment_id IS NOT NULL
GROUP BY comment_id
ORDER BY like_count DESC;
