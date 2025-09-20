const pool = require('../config/db');

exports.completeLesson = async (req, res) => {
    const { lessonId } = req.body;
    const userId = req.userData.userId;

    if (!lessonId) {
        return res.status(400).json({ message: "Lesson ID is required." });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Mark the lesson as complete
        await connection.execute(
            'INSERT INTO completed_lessons (user_id, lesson_id) VALUES (?, ?)',
            [userId, lessonId]
        );

        // 2. Check if the chapter is now complete
        const [lessonInfo] = await connection.execute('SELECT chapter_id FROM lessons WHERE id = ?', [lessonId]);
        const chapterId = lessonInfo[0].chapter_id;

        const [totalLessonsInChapter] = await connection.execute('SELECT COUNT(*) as count FROM lessons WHERE chapter_id = ?', [chapterId]);
        const [completedLessonsInChapter] = await connection.execute(
            `SELECT COUNT(*) as count FROM completed_lessons cl 
             JOIN lessons l ON cl.lesson_id = l.id 
             WHERE cl.user_id = ? AND l.chapter_id = ?`,
            [userId, chapterId]
        );

        if (totalLessonsInChapter[0].count === completedLessonsInChapter[0].count) {
            // Mark chapter as complete
            await connection.execute('INSERT INTO completed_chapters (user_id, chapter_id) VALUES (?, ?)', [userId, chapterId]);
            
            // 3. If chapter was completed, check if the course is now complete
            const [chapterInfo] = await connection.execute('SELECT course_id FROM chapters WHERE id = ?', [chapterId]);
            const courseId = chapterInfo[0].course_id;

            const [totalChaptersInCourse] = await connection.execute('SELECT COUNT(*) as count FROM chapters WHERE course_id = ?', [courseId]);
            const [completedChaptersInCourse] = await connection.execute(
                `SELECT COUNT(*) as count FROM completed_chapters cc
                 JOIN chapters c ON cc.chapter_id = c.id
                 WHERE cc.user_id = ? AND c.course_id = ?`,
                [userId, courseId]
            );

            if (totalChaptersInCourse[0].count === completedChaptersInCourse[0].count) {
                // Mark course as complete
                await connection.execute('INSERT INTO completed_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId]);
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Lesson marked as complete.' });

    } catch (error) {
        await connection.rollback();
        // Ignore "duplicate entry" errors, which means the lesson was already complete
        if (error.code !== 'ER_DUP_ENTRY') {
            console.error("Complete Lesson Error:", error);
            return res.status(500).json({ message: 'Server error completing lesson.' });
        }
        // If it's a duplicate error, it's still a success from the user's perspective
        res.status(200).json({ message: 'Lesson was already complete.' });
    } finally {
        connection.release();
    }
};