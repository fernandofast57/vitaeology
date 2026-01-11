SELECT challenge, current_day, status, COUNT(*) as count
FROM challenge_subscribers
GROUP BY challenge, current_day, status
ORDER BY challenge, current_day;
