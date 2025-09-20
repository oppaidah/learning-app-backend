USE learning_app_db;


DROP TABLE IF EXISTS completed_courses;
DROP TABLE IF EXISTS completed_chapters;
DROP TABLE IF EXISTS completed_lessons;
DROP TABLE IF EXISTS user_courses;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS users;



CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255) DEFAULT 'assets/profile_pic.png',
    -- Added subscription_status directly to the user table
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'Free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    price VARCHAR(50),
    image_url VARCHAR(255),
    description TEXT,
    tags VARCHAR(255)
);

CREATE TABLE chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    lesson_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT,
    video_url VARCHAR(255),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE user_courses (
    user_id INT NOT NULL, 
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    features TEXT
);

CREATE TABLE completed_lessons (
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE completed_chapters (
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE completed_courses (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);



INSERT INTO subscription_plans (plan_name, price_monthly, description, features) VALUES
('Basic', 9.99, 'Unlock essential courses and features.', '["Access to All Basic Courses"]'),
('Pro', 19.99, 'Get certificates and offline access.', '["Access to All Courses", "Certification on Completion", "Offline Access"]'),
('Premium', 29.99, 'Exclusive content and VIP support.', '["Access to All Courses", "Certification on Completion", "Offline Access", "Premium Support", "Access to Exclusive Content"]');

-- Course 1
INSERT INTO courses (id, title, author, price, image_url, description, tags) VALUES (1, 'Visual Design', 'By: Luis John', '$250', 'assets/course_1.png', 'A comprehensive guide to visual design principles.', 'UI,UX,Design');
INSERT INTO chapters (id, course_id, chapter_number, title) VALUES (1, 1, 1, 'Introduction'), (2, 1, 2, 'Core Principles');
INSERT INTO lessons (chapter_id, lesson_number, title, duration_minutes) VALUES (1, 1, 'Welcome', 5), (1, 2, 'What is Visual Design?', 15), (2, 1, 'Color Theory', 25), (2, 2, 'Typography Basics', 20);

-- Course 2
INSERT INTO courses (id, title, author, price, image_url, description, tags) VALUES (2, 'UX Research', 'By: Aina Asif', '$250', 'assets/course_2.png', 'Learn how to conduct effective user research.', 'UX,Research');
INSERT INTO chapters (id, course_id, chapter_number, title) VALUES (3, 2, 1, 'Understanding Your User');
INSERT INTO lessons (chapter_id, lesson_number, title, duration_minutes) VALUES (3, 1, 'Interview Techniques', 45);

-- Course 3
INSERT INTO courses (id, title, author, price, image_url, description, tags) VALUES (3, 'Animation Basics', 'By: Jane Doe', '$180', 'assets/course_3.png', 'Discover the 12 principles of animation.', 'Animation,2D,Motion');
INSERT INTO chapters (id, course_id, chapter_number, title) VALUES (4, 3, 1, 'The 12 Principles');
INSERT INTO lessons (chapter_id, lesson_number, title, duration_minutes) VALUES (4, 1, 'Squash and Stretch', 20), (4, 2, 'Timing and Spacing', 25);

-- Course 4
INSERT INTO courses (id, title, author, price, image_url, description, tags) VALUES (4, 'Graphic Design Intro', 'By: John Smith', '$150', 'assets/course_4.png', 'A beginner-friendly introduction to branding.', 'Graphic Design,Branding');
INSERT INTO chapters (id, course_id, chapter_number, title) VALUES (5, 4, 1, 'Branding Fundamentals'), (6, 4, 2, 'Working with Layouts');
INSERT INTO lessons (chapter_id, lesson_number, title, duration_minutes) VALUES (5, 1, 'What is a Brand?', 10), (6, 1, 'The Grid System', 30);