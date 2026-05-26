const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    const plainUser = typeof user.toObject === 'function' ? user.toObject() : user;
    const { password, ...safeUser } = plainUser;
    return safeUser;
}

function createToken(user) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT secret is not configured');
    }

    return jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        },
        jwtSecret,
        { expiresIn: '7d' }
    );
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users.map(sanitizeUser));
    } catch (err) {
        res.status(500).json({ message: err.message });
    } 
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    } 
};

exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ email, password: hashedPassword, role: 'user' });
        await user.save();
        res.status(201).json(sanitizeUser(user));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.password.startsWith('$2')) {
            user.password = await bcrypt.hash(password, SALT_ROUNDS);
            await user.save();
        }

        const token = createToken(user);

        res.json({
            token,
            role: user.role,
            email: user.email,
            userId: user._id,
            userEmail: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

