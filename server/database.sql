CREATE DATABASE IF NOT EXISTS nghtshftrs;
USE nghtshftrs;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('Street Race', 'Car Meet', 'Toughe', 'Drift Trial', 'Other') DEFAULT 'Other',
    date VARCHAR(100),
    location VARCHAR(255),
    location_image TEXT,
    route_image TEXT,
    reward VARCHAR(100),
    price INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url TEXT NOT NULL,
    caption VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    car_model VARCHAR(100),
    car_photo TEXT,
    id_card_photo TEXT,
    profile_photo TEXT,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    wins_1st INT DEFAULT 0,
    wins_2nd INT DEFAULT 0,
    wins_3rd INT DEFAULT 0,
    bio TEXT,
    social_links TEXT,
    theme_color VARCHAR(20) DEFAULT '#ff2d55',
    font_family VARCHAR(50) DEFAULT 'Inter',
    background_url TEXT,
    music_url TEXT,
    show_car BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    member_id INT NOT NULL,
    qualifying_time BIGINT DEFAULT NULL,
    is_dnf BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO admins (username, password) VALUES ('admin', 'admin123');
