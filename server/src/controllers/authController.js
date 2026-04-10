const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Allow cross-site cookies in production (frontend and api on different subdomains)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function internalError(res, message, error) {
    const response = { message };
    if (process.env.NODE_ENV !== "production") response.error = error.message;
    return res.status(500).json(response);
}

function signToken(user) {
    return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.checkUser = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ message: "Username is required." });

        const [rows] = await pool.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
        if (rows.length === 0) return res.status(404).json({ message: "No such goon exists." });

        return res.json({ exists: true });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [existingRows] = await pool.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
        if (existingRows.length > 0) return res.status(409).json({ message: "Username already in use" });

        const passwordHash = await bcrypt.hash(password, 12);
        const derivedEmail = `${username}@sicari.local`;
        const [insertResult] = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, derivedEmail, passwordHash, "mercenary"]
        );

        const user = { id: insertResult.insertId, username };
        const token = signToken(user);

        res.cookie("jwt", token, cookieOptions);
        return res.status(201).json({ message: "User created", user });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query("SELECT id, username, password FROM users WHERE username = ? LIMIT 1", [username]);

        const user = rows[0];
        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        const storedPassword = user.password || "";
        const isBcryptHash = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$");

        let isMatch = false;
        if (isBcryptHash) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            isMatch = storedPassword === password;
            if (isMatch) {
                const upgradedHash = await bcrypt.hash(password, 12);
                await pool.query("UPDATE users SET password = ? WHERE id = ?", [upgradedHash, user.id]);
            }
        }

        if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

        const token = signToken(user);
        res.cookie("jwt", token, cookieOptions);

        return res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) { return internalError(res, "Internal server error", error); }
};

exports.logout = (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Logged out successfully" });
};

exports.getUsers = async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, username, created_at FROM users ORDER BY id DESC");
        return res.json(rows);
    } catch (error) { return internalError(res, "Internal server error", error); }
};

exports.getMe = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, username, created_at FROM users WHERE id = ? LIMIT 1", [req.user.sub]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ user });
    } catch (error) { return internalError(res, "Internal server error", error); }
};