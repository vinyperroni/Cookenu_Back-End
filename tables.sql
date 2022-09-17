CREATE TABLE IF NOT EXISTS cookenu_user (
	id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM("NORMAL", "ADMIN") DEFAULT "NORMAl"
);

CREATE TABLE IF NOT EXISTS cookenu_follower (
	follower_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES cookenu_user(id),
	following_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (following_id) REFERENCES cookenu_user(id)
);

CREATE TABLE IF NOT EXISTS cookenu_recipe (
	id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) NOT NULL,
	FOREIGN KEY (creator_id) REFERENCES cookenu_user(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at DATE NOT NULL
);