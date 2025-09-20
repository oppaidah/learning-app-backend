const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
    try {
        const { tag } = req.query;
        let query = 'SELECT * FROM courses';
        const params = [];
        if (tag && tag !== 'All') {
            query += ' WHERE tags LIKE ?';
            params.push(`%${tag}%`);
        }
        const [courses] = await pool.execute(query, params);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Get All Courses Error:", error);
        res.status(500).json({ message: "Server error while fetching courses." });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const [courses] = await pool.execute("SELECT tags FROM courses WHERE tags IS NOT NULL AND tags != ''");
        const tagSet = new Set();
        courses.forEach(course => {
            const tags = course.tags.split(',').map(tag => tag.trim());
            tags.forEach(tag => tagSet.add(tag));
        });
        res.status(200).json(Array.from(tagSet));
    } catch (error) {
        console.error("Get All Tags Error:", error);
        res.status(500).json({ message: "Server error while fetching tags." });
    }
};

exports.searchCourses = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: "Search query 'q' is required." });
        }
        const searchQuery = `SELECT * FROM courses WHERE title LIKE ?`;
        const [courses] = await pool.execute(searchQuery, [`%${q}%`]);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Search Courses Error:", error);
        res.status(500).json({ message: "Server error during search." });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const [courseResult] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);
        if (courseResult.length === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        const course = courseResult[0];
        const [chapters] = await pool.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY chapter_number ASC', [id]);
        const chapterIds = chapters.map(c => c.id);
        let lessons = [];
        if (chapterIds.length > 0) {
            const [lessonResults] = await pool.query('SELECT * FROM lessons WHERE chapter_id IN (?) ORDER BY lesson_number ASC', [chapterIds]);
            lessons = lessonResults;
        }
        const chaptersWithLessons = chapters.map(chapter => ({ ...chapter, lessons: lessons.filter(lesson => lesson.chapter_id === chapter.id) }));
        const finalCourseData = { ...course, chapters: chaptersWithLessons };
        res.status(200).json(finalCourseData);
    } catch (error) {
        console.error("Get Course By ID Error:", error);
        res.status(500).json({ message: "Server error while fetching course details." });
    }
};

exports.getMyCourses = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const query = `SELECT c.* FROM courses c JOIN user_courses uc ON c.id = uc.course_id WHERE uc.user_id = ?`;
        const [myCourses] = await pool.execute(query, [userId]);
        res.status(200).json(myCourses);
    } catch (error) {
        console.error("Get My Courses Error:", error);
        res.status(500).json({ message: "Server error while fetching user courses." });
    }
};

exports.enrollInCourse = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required." });
        }
        const [existing] = await pool.execute('SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        if (existing.length > 0) {
            return res.status(200).json({ message: "Already enrolled." });
        }
        await pool.execute('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId]);
        res.status(201).json({ message: "Course saved successfully!" });
    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({ message: "Server error during enrollment." });
    }
};

exports.unenrollFromCourse = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required." });
        }
        await pool.execute('DELETE FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        res.status(200).json({ message: "Course unsaved successfully!" });
    } catch (error) {
        console.error("Unenrollment Error:", error);
        res.status(500).json({ message: "Server error during unenrollment." });
    }
};

exports.getCompletedCourses = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const query = `
            SELECT c.* FROM courses c
            JOIN completed_courses cc ON c.id = cc.course_id
            WHERE cc.user_id = ?
        `;
        const [completedCourses] = await pool.execute(query, [userId]);
        res.status(200).json(completedCourses);
    } catch (error) {
        console.error("Get Completed Courses Error:", error);
        res.status(500).json({ message: "Server error while fetching completed courses." });
    }
};