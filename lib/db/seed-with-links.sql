-- Enhanced seed data with bracket progression links
-- Run this AFTER the main seed.sql to add next_game_id relationships

-- Link Round of 64 games to Round of 32 (East Region)
-- Game 1 (1v16) winner → Round of 32 Game 1
-- Game 2 (8v9) winner → Round of 32 Game 1
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 1)
WHERE round = 'round_64' AND game_number IN (1, 2);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 2)
WHERE round = 'round_64' AND game_number IN (3, 4);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 3)
WHERE round = 'round_64' AND game_number IN (5, 6);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 4)
WHERE round = 'round_64' AND game_number IN (7, 8);

-- Link Round of 64 games to Round of 32 (West Region)
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 5)
WHERE round = 'round_64' AND game_number IN (9, 10);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 6)
WHERE round = 'round_64' AND game_number IN (11, 12);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 7)
WHERE round = 'round_64' AND game_number IN (13, 14);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 8)
WHERE round = 'round_64' AND game_number IN (15, 16);

-- Link Round of 64 games to Round of 32 (South Region)
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 9)
WHERE round = 'round_64' AND game_number IN (17, 18);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 10)
WHERE round = 'round_64' AND game_number IN (19, 20);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 11)
WHERE round = 'round_64' AND game_number IN (21, 22);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 12)
WHERE round = 'round_64' AND game_number IN (23, 24);

-- Link Round of 64 games to Round of 32 (Midwest Region)
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 13)
WHERE round = 'round_64' AND game_number IN (25, 26);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 14)
WHERE round = 'round_64' AND game_number IN (27, 28);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 15)
WHERE round = 'round_64' AND game_number IN (29, 30);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'round_32' AND game_number = 16)
WHERE round = 'round_64' AND game_number IN (31, 32);

-- Link Round of 32 to Sweet 16
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 1)
WHERE round = 'round_32' AND game_number IN (1, 2);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 2)
WHERE round = 'round_32' AND game_number IN (3, 4);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 3)
WHERE round = 'round_32' AND game_number IN (5, 6);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 4)
WHERE round = 'round_32' AND game_number IN (7, 8);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 5)
WHERE round = 'round_32' AND game_number IN (9, 10);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 6)
WHERE round = 'round_32' AND game_number IN (11, 12);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 7)
WHERE round = 'round_32' AND game_number IN (13, 14);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'sweet_16' AND game_number = 8)
WHERE round = 'round_32' AND game_number IN (15, 16);

-- Link Sweet 16 to Elite 8
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'elite_8' AND game_number = 1)
WHERE round = 'sweet_16' AND game_number IN (1, 2);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'elite_8' AND game_number = 2)
WHERE round = 'sweet_16' AND game_number IN (3, 4);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'elite_8' AND game_number = 3)
WHERE round = 'sweet_16' AND game_number IN (5, 6);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'elite_8' AND game_number = 4)
WHERE round = 'sweet_16' AND game_number IN (7, 8);

-- Link Elite 8 to Final Four
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'final_4' AND game_number = 1)
WHERE round = 'elite_8' AND game_number IN (1, 2);

UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'final_4' AND game_number = 2)
WHERE round = 'elite_8' AND game_number IN (3, 4);

-- Link Final Four to Championship
UPDATE games SET next_game_id = (SELECT id FROM games WHERE round = 'championship' AND game_number = 1)
WHERE round = 'final_4' AND game_number IN (1, 2);
