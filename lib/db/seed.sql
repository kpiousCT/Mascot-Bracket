-- Seed data for NCAA Tournament 2026
-- Complete 64-team bracket (16 teams per region)

INSERT INTO teams (name, mascot_name, mascot_image_url, seed, region) VALUES
-- EAST REGION
('Duke', 'Blue Devils', '/mascots/Duke.jpeg', 1, 'East'),
('Siena', 'Saints', '/mascots/Siena.jpeg', 16, 'East'),
('Ohio State', 'Buckeyes', '/mascots/Ohio State.jpeg', 8, 'East'),
('TCU', 'Horned Frogs', '/mascots/TCU.jpeg', 9, 'East'),
('St. John''s', 'Red Storm', '/mascots/St. John''s.jpeg', 5, 'East'),
('Northern Iowa', 'Panthers', '/mascots/Northern Iowa.jpeg', 12, 'East'),
('Kansas', 'Jayhawks', '/mascots/Kansas.jpeg', 4, 'East'),
('Cal Baptist', 'Lancers', '/mascots/Cal Baptist.jpeg', 13, 'East'),
('Louisville', 'Cardinals', '/mascots/Louisville.jpeg', 6, 'East'),
('South Florida', 'Bulls', '/mascots/South Florida.jpeg', 11, 'East'),
('Michigan State', 'Spartans', '/mascots/Michigan State.jpeg', 3, 'East'),
('North Dakota State', 'Bison', '/mascots/North Dakota State.jpeg', 14, 'East'),
('UCLA', 'Bruins', '/mascots/UCLA.jpeg', 7, 'East'),
('UCF', 'Knights', '/mascots/UCF.jpeg', 10, 'East'),
('UConn', 'Huskies', '/mascots/UConn.jpeg', 2, 'East'),
('Furman', 'Paladins', '/mascots/Furman.jpeg', 15, 'East'),

-- WEST REGION
('Arizona', 'Wildcats', '/mascots/Arizona.jpeg', 1, 'West'),
('LIU', 'Sharks', '/mascots/LIU.jpeg', 16, 'West'),
('Villanova', 'Wildcats', '/mascots/Villanova.jpeg', 8, 'West'),
('Utah State', 'Aggies', '/mascots/Utah State.jpeg', 9, 'West'),
('Wisconsin', 'Badgers', '/mascots/Wisconsin.jpeg', 5, 'West'),
('High Point', 'Panthers', '/mascots/High Point.jpeg', 12, 'West'),
('Arkansas', 'Razorbacks', '/mascots/Arkansas.jpeg', 4, 'West'),
('Hawaii', 'Warriors', '/mascots/Hawaii.jpeg', 13, 'West'),
('BYU', 'Cougars', '/mascots/BYU.jpeg', 6, 'West'),
('Texas', 'Longhorns', '/mascots/Texas.jpeg', 11, 'West'),
('NC State', 'Wolfpack', '/mascots/NC State.jpeg', 11, 'West'),
('Gonzaga', 'Bulldogs', '/mascots/Gonzaga.jpeg', 3, 'West'),
('Kennesaw State', 'Owls', '/mascots/Kennesaw State.jpeg', 14, 'West'),
('Miami', 'Hurricanes', '/mascots/Miami.jpeg', 7, 'West'),
('Missouri', 'Tigers', '/mascots/Missouri.jpeg', 10, 'West'),
('Purdue', 'Boilermakers', '/mascots/Purdue.jpeg', 2, 'West'),
('Queens', 'Royals', '/mascots/Queens.jpeg', 15, 'West'),

-- MIDWEST REGION
('Michigan', 'Wolverines', '/mascots/Michigan.jpeg', 1, 'Midwest'),
('UMBC', 'Retrievers', '/mascots/UMBC.jpeg', 16, 'Midwest'),
('Howard', 'Bison', '/mascots/Howard.jpeg', 16, 'Midwest'),
('Georgia', 'Bulldogs', '/mascots/Georgia.jpeg', 8, 'Midwest'),
('Saint Louis', 'Billikens', '/mascots/Saint Louis.jpeg', 9, 'Midwest'),
('Texas Tech', 'Red Raiders', '/mascots/Texas Tech.jpeg', 5, 'Midwest'),
('Akron', 'Zips', '/mascots/Akron.jpeg', 12, 'Midwest'),
('Alabama', 'Crimson Tide', '/mascots/Alabama.jpeg', 4, 'Midwest'),
('Hofstra', 'Pride', '/mascots/Hofstra.jpeg', 13, 'Midwest'),
('Tennessee', 'Volunteers', '/mascots/Tennessee.jpeg', 6, 'Midwest'),
('SMU', 'Mustangs', '/mascots/SMU.jpeg', 11, 'Midwest'),
('Miami (Ohio)', 'RedHawks', '/mascots/Miami (Ohio).jpeg', 11, 'Midwest'),
('Virginia', 'Cavaliers', '/mascots/Virginia.jpeg', 3, 'Midwest'),
('Wright State', 'Raiders', '/mascots/Wright State.jpeg', 14, 'Midwest'),
('Kentucky', 'Wildcats', '/mascots/Kentucky.jpeg', 7, 'Midwest'),
('Santa Clara', 'Broncos', '/mascots/Santa Clara.jpeg', 10, 'Midwest'),
('Iowa State', 'Cyclones', '/mascots/Iowa State.jpeg', 2, 'Midwest'),
('Tennessee State', 'Tigers', '/mascots/Tennessee State.jpeg', 15, 'Midwest'),

-- SOUTH REGION
('Florida', 'Gators', '/mascots/Florida.png', 1, 'South'),
('Prairie View A&M', 'Panthers', '/mascots/Prairie View A&M.jpeg', 16, 'South'),
('Lehigh', 'Mountain Hawks', '/mascots/Lehigh.jpeg', 16, 'South'),
('Clemson', 'Tigers', '/mascots/Clemson.jpeg', 8, 'South'),
('Iowa', 'Hawkeyes', '/mascots/Iowa.jpeg', 9, 'South'),
('Vanderbilt', 'Commodores', '/mascots/Vanderbilt.jpeg', 5, 'South'),
('McNeese', 'Cowboys', '/mascots/McNeese.jpeg', 12, 'South'),
('Nebraska', 'Cornhuskers', '/mascots/Nebraska.jpeg', 4, 'South'),
('Troy', 'Trojans', '/mascots/Troy.jpeg', 13, 'South'),
('North Carolina', 'Tar Heels', '/mascots/North Carolina.jpeg', 6, 'South'),
('VCU', 'Rams', '/mascots/VCU.jpeg', 11, 'South'),
('Illinois', 'Fighting Illini', '/mascots/Illinois.jpeg', 3, 'South'),
('Penn', 'Quakers', '/mascots/Penn.jpeg', 14, 'South'),
('Saint Mary''s', 'Gaels', '/mascots/Saint Mary''s.jpeg', 7, 'South'),
('Texas A&M', 'Aggies', '/mascots/Texas A&M.jpeg', 10, 'South'),
('Houston', 'Cougars', '/mascots/Houston.jpeg', 2, 'South'),
('Idaho', 'Vandals', '/mascots/Idaho.jpeg', 15, 'South');
-- Create Round of 64 games (32 games total - 8 per region)
-- Traditional bracket matchups: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15

-- East Region Round of 64
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
-- 1v16
('round_64', 1, 'East',
    (SELECT id FROM teams WHERE seed = 1 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 16 AND region = 'East')),
-- 8v9
('round_64', 2, 'East',
    (SELECT id FROM teams WHERE seed = 8 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 9 AND region = 'East')),
-- 5v12
('round_64', 3, 'East',
    (SELECT id FROM teams WHERE seed = 5 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 12 AND region = 'East')),
-- 4v13
('round_64', 4, 'East',
    (SELECT id FROM teams WHERE seed = 4 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 13 AND region = 'East')),
-- 6v11
('round_64', 5, 'East',
    (SELECT id FROM teams WHERE seed = 6 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 11 AND region = 'East')),
-- 3v14
('round_64', 6, 'East',
    (SELECT id FROM teams WHERE seed = 3 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 14 AND region = 'East')),
-- 7v10
('round_64', 7, 'East',
    (SELECT id FROM teams WHERE seed = 7 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 10 AND region = 'East')),
-- 2v15
('round_64', 8, 'East',
    (SELECT id FROM teams WHERE seed = 2 AND region = 'East'),
    (SELECT id FROM teams WHERE seed = 15 AND region = 'East'));

-- West Region Round of 64
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('round_64', 9, 'West',
    (SELECT id FROM teams WHERE seed = 1 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 16 AND region = 'West')),
('round_64', 10, 'West',
    (SELECT id FROM teams WHERE seed = 8 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 9 AND region = 'West')),
('round_64', 11, 'West',
    (SELECT id FROM teams WHERE seed = 5 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 12 AND region = 'West')),
('round_64', 12, 'West',
    (SELECT id FROM teams WHERE seed = 4 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 13 AND region = 'West')),
('round_64', 13, 'West',
    (SELECT id FROM teams WHERE seed = 6 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 11 AND region = 'West')),
('round_64', 14, 'West',
    (SELECT id FROM teams WHERE seed = 3 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 14 AND region = 'West')),
('round_64', 15, 'West',
    (SELECT id FROM teams WHERE seed = 7 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 10 AND region = 'West')),
('round_64', 16, 'West',
    (SELECT id FROM teams WHERE seed = 2 AND region = 'West'),
    (SELECT id FROM teams WHERE seed = 15 AND region = 'West'));

-- South Region Round of 64
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('round_64', 17, 'South',
    (SELECT id FROM teams WHERE seed = 1 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 16 AND region = 'South')),
('round_64', 18, 'South',
    (SELECT id FROM teams WHERE seed = 8 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 9 AND region = 'South')),
('round_64', 19, 'South',
    (SELECT id FROM teams WHERE seed = 5 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 12 AND region = 'South')),
('round_64', 20, 'South',
    (SELECT id FROM teams WHERE seed = 4 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 13 AND region = 'South')),
('round_64', 21, 'South',
    (SELECT id FROM teams WHERE seed = 6 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 11 AND region = 'South')),
('round_64', 22, 'South',
    (SELECT id FROM teams WHERE seed = 3 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 14 AND region = 'South')),
('round_64', 23, 'South',
    (SELECT id FROM teams WHERE seed = 7 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 10 AND region = 'South')),
('round_64', 24, 'South',
    (SELECT id FROM teams WHERE seed = 2 AND region = 'South'),
    (SELECT id FROM teams WHERE seed = 15 AND region = 'South'));

-- Midwest Region Round of 64
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('round_64', 25, 'Midwest',
    (SELECT id FROM teams WHERE seed = 1 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 16 AND region = 'Midwest')),
('round_64', 26, 'Midwest',
    (SELECT id FROM teams WHERE seed = 8 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 9 AND region = 'Midwest')),
('round_64', 27, 'Midwest',
    (SELECT id FROM teams WHERE seed = 5 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 12 AND region = 'Midwest')),
('round_64', 28, 'Midwest',
    (SELECT id FROM teams WHERE seed = 4 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 13 AND region = 'Midwest')),
('round_64', 29, 'Midwest',
    (SELECT id FROM teams WHERE seed = 6 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 11 AND region = 'Midwest')),
('round_64', 30, 'Midwest',
    (SELECT id FROM teams WHERE seed = 3 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 14 AND region = 'Midwest')),
('round_64', 31, 'Midwest',
    (SELECT id FROM teams WHERE seed = 7 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 10 AND region = 'Midwest')),
('round_64', 32, 'Midwest',
    (SELECT id FROM teams WHERE seed = 2 AND region = 'Midwest'),
    (SELECT id FROM teams WHERE seed = 15 AND region = 'Midwest'));

-- Create Round of 32 games (16 games - 4 per region)
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
-- East Region Round of 32
('round_32', 1, 'East', NULL, NULL),
('round_32', 2, 'East', NULL, NULL),
('round_32', 3, 'East', NULL, NULL),
('round_32', 4, 'East', NULL, NULL),
-- West Region Round of 32
('round_32', 5, 'West', NULL, NULL),
('round_32', 6, 'West', NULL, NULL),
('round_32', 7, 'West', NULL, NULL),
('round_32', 8, 'West', NULL, NULL),
-- South Region Round of 32
('round_32', 9, 'South', NULL, NULL),
('round_32', 10, 'South', NULL, NULL),
('round_32', 11, 'South', NULL, NULL),
('round_32', 12, 'South', NULL, NULL),
-- Midwest Region Round of 32
('round_32', 13, 'Midwest', NULL, NULL),
('round_32', 14, 'Midwest', NULL, NULL),
('round_32', 15, 'Midwest', NULL, NULL),
('round_32', 16, 'Midwest', NULL, NULL);

-- Create Sweet 16 games (8 games - 2 per region)
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('sweet_16', 1, 'East', NULL, NULL),
('sweet_16', 2, 'East', NULL, NULL),
('sweet_16', 3, 'West', NULL, NULL),
('sweet_16', 4, 'West', NULL, NULL),
('sweet_16', 5, 'South', NULL, NULL),
('sweet_16', 6, 'South', NULL, NULL),
('sweet_16', 7, 'Midwest', NULL, NULL),
('sweet_16', 8, 'Midwest', NULL, NULL);

-- Create Elite 8 games (4 games - 1 per region)
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('elite_8', 1, 'East', NULL, NULL),
('elite_8', 2, 'West', NULL, NULL),
('elite_8', 3, 'South', NULL, NULL),
('elite_8', 4, 'Midwest', NULL, NULL);

-- Create Final Four games (2 games)
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('final_4', 1, NULL, NULL, NULL),
('final_4', 2, NULL, NULL, NULL);

-- Create Championship game (1 game)
INSERT INTO games (round, game_number, region, team1_id, team2_id) VALUES
('championship', 1, NULL, NULL, NULL);

-- Note: In a full implementation, you would also set up next_game_id relationships
-- to properly link the bracket progression from Round of 64 → Championship
-- For now, this provides all 63 games needed for the tournament
