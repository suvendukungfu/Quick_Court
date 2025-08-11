-- ADD TEST FACILITIES TO THE DATABASE
-- Run this in Supabase SQL Editor

-- 1. Insert test facilities
INSERT INTO facilities (id, name, description, facility_type, address, city, state, owner_id, status, is_verified, featured, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'Downtown Basketball Court',
    'Professional basketball court with high-quality flooring and adjustable hoops. Perfect for pickup games and tournaments.',
    'basketball_court',
    '123 Main Street',
    'New York',
    'NY',
    (SELECT id FROM users WHERE email = '9610hemant@gmail.com' LIMIT 1),
    'active',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Central Tennis Court',
    'Well-maintained tennis court with proper lighting for evening games. Includes ball machine rental.',
    'tennis_court',
    '456 Park Avenue',
    'New York',
    'NY',
    (SELECT id FROM users WHERE email = '9610hemant@gmail.com' LIMIT 1),
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Community Soccer Field',
    'Large soccer field with artificial turf, goal posts, and spectator seating. Available for leagues and casual play.',
    'soccer_field',
    '789 Sports Lane',
    'New York',
    'NY',
    (SELECT id FROM users WHERE email = '9610hemant@gmail.com' LIMIT 1),
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Elite Fitness Gym',
    'Modern gym with state-of-the-art equipment, personal trainers, and group classes.',
    'gym',
    '321 Fitness Drive',
    'New York',
    'NY',
    (SELECT id FROM users WHERE email = '9610hemant@gmail.com' LIMIT 1),
    'active',
    true,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- 2. Verify facilities were added
SELECT '=== TEST FACILITIES ADDED ===' as info;
SELECT 
    name,
    facility_type,
    city,
    state,
    status,
    is_verified,
    featured
FROM facilities
ORDER BY created_at DESC;

-- 3. Show total count
SELECT 'Total facilities count:' as info, COUNT(*) as count FROM facilities;
