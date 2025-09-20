const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth_routes');
const courseRoutes = require('./routes/course_routes');
const subscriptionRoutes = require('./routes/subscription_routes');
const lessonRoutes = require('./routes/lesson_routes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(authRoutes);
app.use(courseRoutes);
app.use(subscriptionRoutes);
app.use(lessonRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT} and accessible on your network.`);
});