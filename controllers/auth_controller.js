const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = 'your-super-secret-key';

exports.signup = async (req, res) => {
    console.log('Received a signup request!');
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        console.log(`User ${email} signed up and saved to MySQL.`);
        res.status(201).json({ message: `User ${email} created successfully!` });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error during signup." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const user = users[0];

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_picture_url: user.profile_picture_url,
                subscription_status: user.subscription_status
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const [users] = await pool.execute('SELECT id, name, email, profile_picture_url FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error while fetching profile." });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { name, profile_picture_url } = req.body;

        if (!name && !profile_picture_url) {
            return res.status(400).json({ message: "No update data provided." });
        }

        let queryParts = [];
        const params = [];

        if (name) {
            queryParts.push('name = ?');
            params.push(name);
        }
        if (profile_picture_url) {
            queryParts.push('profile_picture_url = ?');
            params.push(profile_picture_url);
        }

        params.push(userId);

        const sql = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
        
        await pool.execute(sql, params);
        
        const [updatedUser] = await pool.execute('SELECT id, name, email, profile_picture_url, subscription_status FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            message: "Profile updated successfully!",
            user: updatedUser[0] 
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};