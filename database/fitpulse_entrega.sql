CREATE DATABASE fitpulse_entrega;
USE fitpulse_entrega;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') NOT NULL DEFAULT 'client'
);

CREATE TABLE classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_class_price CHECK (price >= 0)
);

CREATE TABLE class_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_capacity INT NOT NULL,
    CONSTRAINT fk_session_class
        FOREIGN KEY (class_id)
        REFERENCES classes(class_id),
    CONSTRAINT uq_class_session
        UNIQUE (class_id, start_time, location),
    CONSTRAINT chk_session_time
        CHECK (end_time > start_time),
    CONSTRAINT chk_session_capacity
        CHECK (max_capacity > 0)
);

CREATE TABLE packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    included_classes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_package_classes
        CHECK (included_classes > 0),
    CONSTRAINT chk_package_price
        CHECK (price >= 0)
);

CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    reservation_date DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_reservation_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT fk_reservation_session
        FOREIGN KEY (session_id)
        REFERENCES class_sessions(session_id),
    CONSTRAINT uq_user_session
        UNIQUE (user_id, session_id)
);

CREATE TABLE purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    purchase_date DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    paid_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_purchase_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT fk_purchase_package
        FOREIGN KEY (package_id)
        REFERENCES packages(package_id),
    CONSTRAINT chk_paid_price
        CHECK (paid_price >= 0)
);

CREATE TABLE reviews (
    reservation_id INT PRIMARY KEY,
    rating TINYINT NOT NULL,
    comment TEXT,
    review_date DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id),
    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE review_tags (
    reservation_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (reservation_id, tag_id),
    CONSTRAINT fk_review_tag_review
        FOREIGN KEY (reservation_id)
        REFERENCES reviews(reservation_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_tag_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
);

CREATE TABLE personal_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity VARCHAR(100) NOT NULL,
    record_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    record_date DATE NOT NULL,
    CONSTRAINT fk_record_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT chk_record_value
        CHECK (record_value > 0)
);

CREATE VIEW completed_classes_by_category AS
SELECT
    r.user_id,
    c.category,
    COUNT(*) AS total_classes
FROM reservations r
JOIN class_sessions s
    ON r.session_id = s.session_id
JOIN classes c
    ON s.class_id = c.class_id
WHERE r.status = 'completed'
GROUP BY r.user_id, c.category;

CREATE VIEW daily_sales AS
SELECT
    DATE(purchase_date) AS sale_date,
    COUNT(*) AS total_purchases,
    SUM(paid_price) AS total_sales
FROM purchases
GROUP BY DATE(purchase_date);

CREATE VIEW progress AS
WITH attendance_dates AS (
    SELECT DISTINCT
        r.user_id,
        DATE(s.start_time) AS attendance_date
    FROM reservations r
    JOIN class_sessions s
        ON r.session_id = s.session_id
    WHERE r.status = 'completed'
),
numbered_dates AS (
    SELECT
        user_id,
        attendance_date,
        DATE_SUB(
            attendance_date,
            INTERVAL ROW_NUMBER() OVER (
                PARTITION BY user_id
                ORDER BY attendance_date
            ) DAY
        ) AS streak_group
    FROM attendance_dates
),
streak_groups AS (
    SELECT
        user_id,
        COUNT(*) AS streak_days,
        MAX(attendance_date) AS last_attendance
    FROM numbered_dates
    GROUP BY user_id, streak_group
),
latest_streak AS (
    SELECT
        user_id,
        streak_days,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY last_attendance DESC
        ) AS row_num
    FROM streak_groups
)
SELECT
    u.user_id,
    COUNT(r.reservation_id) AS completed_classes,
    COALESCE(MAX(ls.streak_days), 0) AS attendance_streak
FROM users u
LEFT JOIN reservations r
    ON u.user_id = r.user_id
    AND r.status = 'completed'
LEFT JOIN latest_streak ls
    ON u.user_id = ls.user_id
    AND ls.row_num = 1
GROUP BY u.user_id;

INSERT INTO users (
    name, email, password, role
) VALUES
('Test Administrator', 'admin@fitpulse.test', 'admin123', 'admin'),
('Test Client One', 'client1@fitpulse.test', 'pass123', 'client'),
('Test Client Two', 'client2@fitpulse.test', 'pass123', 'client'),
('Test Client Three', 'client3@fitpulse.test', 'pass123', 'client');

INSERT INTO classes (
    name, category, description, price
) VALUES
('Yoga', 'Flexibility', 'Beginner yoga class', 25000),
('Spinning', 'Cardio', 'Indoor cycling class', 30000),
('Functional Training', 'Strength', 'Full body training', 35000),
('Pilates', 'Flexibility', 'Pilates training session', 28000),
('Zumba', 'Cardio', 'Dance fitness session', 22000);

INSERT INTO class_sessions (
    class_id, instructor, location,
    start_time, end_time, max_capacity
) VALUES
(1, 'Sofia Martinez', 'North Studio', '2026-10-20 08:00:00', '2026-10-20 09:00:00', 15),
(1, 'Sofia Martinez', 'North Studio', '2026-10-22 08:00:00', '2026-10-22 09:00:00', 15),
(2, 'Carlos Lopez', 'Cycle Room', '2026-10-21 10:00:00', '2026-10-21 11:00:00', 20),
(3, 'David Gomez', 'Main Hall', '2026-10-23 17:00:00', '2026-10-23 18:00:00', 18),
(4, 'Ana Torres', 'North Studio', '2026-10-24 09:00:00', '2026-10-24 10:00:00', 12),
(5, 'Maria Lopez', 'Main Hall', '2026-10-25 16:00:00', '2026-10-25 17:00:00', 25),
(1, 'Sofia Martinez', 'North Studio', '2026-10-05 08:00:00', '2026-10-05 09:00:00', 15),
(2, 'Carlos Lopez', 'Cycle Room', '2026-10-06 10:00:00', '2026-10-06 11:00:00', 20),
(1, 'Sofia Martinez', 'North Studio', '2026-10-07 08:00:00', '2026-10-07 09:00:00', 15);

INSERT INTO packages (
    name, included_classes, price
) VALUES
('Basic', 4, 90000),
('Standard', 8, 170000),
('Premium', 12, 240000),
('Unlimited', 30, 450000);

INSERT INTO reservations (
    user_id, session_id, status
) VALUES
(2, 1, 'confirmed'),
(3, 3, 'confirmed'),
(4, 4, 'pending'),
(2, 7, 'completed'),
(3, 8, 'completed'),
(2, 9, 'completed'),
(4, 5, 'confirmed');

INSERT INTO purchases (
    user_id, package_id, purchase_date, paid_price
) VALUES
(2, 1, '2026-10-13 09:00:00', 90000),
(3, 2, '2026-10-13 10:00:00', 170000),
(4, 3, '2026-10-12 11:00:00', 240000),
(2, 4, '2026-10-13 14:00:00', 450000);

INSERT INTO reviews (
    reservation_id, rating, comment
) VALUES
(4, 5, 'Excellent yoga session'),
(5, 4, 'Great spinning session'),
(6, 5, 'Very relaxing class');

INSERT INTO tags (name) VALUES
('Relaxing'),
('Motivating'),
('Intense'),
('Good Instructor'),
('Recommended');

INSERT INTO review_tags (
    reservation_id, tag_id
) VALUES
(4, 1),
(4, 4),
(5, 2),
(5, 3),
(6, 1),
(6, 5);

INSERT INTO personal_records (
    user_id, activity, record_value, unit, record_date
) VALUES
(2, 'Squat', 50, 'kg', '2026-10-05'),
(2, 'Running', 5, 'km', '2026-10-06'),
(3, 'Deadlift', 60, 'kg', '2026-10-06'),
(3, 'Running', 10, 'km', '2026-10-07'),
(4, 'Bench Press', 40, 'kg', '2026-10-08');

SELECT * FROM users;
SELECT * FROM classes;
SELECT * FROM class_sessions;
SELECT * FROM packages;
SELECT * FROM reservations;
SELECT * FROM purchases;
SELECT * FROM reviews;
SELECT * FROM tags;
SELECT * FROM review_tags;
SELECT * FROM personal_records;
SELECT * FROM progress;
SELECT * FROM completed_classes_by_category;
SELECT * FROM daily_sales;
