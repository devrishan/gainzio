USE sparkio;

-- Seed Admin User
INSERT INTO users (username, email, password_hash, role, referral_code, referred_by)
VALUES
  ('admin', 'admin@sparkio.app', '$2y$10$KIX0jzvYJIUKbzEuKnhGHeJzi10BGSAdoo6gWQBaIjXImQxGc1d1C', 'admin', 'SPARKADMIN', NULL)
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Ensure admin wallet exists
INSERT INTO wallets (user_id, balance, total_earned)
SELECT id, 0.00, 0.00 FROM users WHERE email = 'admin@sparkio.app'
ON DUPLICATE KEY UPDATE balance = wallets.balance;

-- Sample Ads
INSERT INTO ads (name, ad_placement_id, ad_code_snippet, is_active) VALUES
  ('Dashboard Sidebar Promo', 'dashboard_sidebar', '<div class=\"ad-card\">Upgrade to Sparkio Pro today!</div>', 1),
  ('Referral Page Footer', 'referral_page_footer', '<script>console.log(\"Sparkio referral footer ad\");</script>', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  ad_code_snippet = VALUES(ad_code_snippet),
  is_active = VALUES(is_active);

