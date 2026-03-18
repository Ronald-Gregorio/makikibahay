import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const googleAuth = async (req: Request, res: Response) => {
    const { email, name, avatar, googleId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user info if needed
            user.name = name;
            user.avatar = avatar;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                email,
                name,
                avatar,
                role: 'user', // Default role
                preferences: {
                    isStudent: true, // Default
                    accommodationType: 'solo',
                    priceMin: 0,
                    priceMax: 10000,
                    amenities: [],
                    proximityMinutes: 10
                }
            });
        }

        const token = generateToken((user._id as any).toString());

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token,
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    const { name, email, username, password, role } = req.body;
    console.log('Register attempt:', { name, email, username, role });
    try {
        // Check email uniqueness
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            res.status(400).json({ message: 'Email is already in use', field: 'email' });
            return;
        }

        // Check username uniqueness (if provided)
        if (username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                res.status(400).json({ message: 'Username is already taken', field: 'username' });
                return;
            }
        }

        // Validate password strength
        if (!password || password.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters long', field: 'password' });
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number', field: 'password' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData: any = {
            email: email.toLowerCase(),
            name,
            password: hashedPassword,
            role: role || 'user',
            preferences: {
                isStudent: true,
                accommodationType: 'solo',
                priceMin: 0,
                priceMax: 10000,
                amenities: [],
                proximityMinutes: 10
            }
        };
        if (username) userData.username = username;

        const user = await User.create(userData);

        const token = generateToken((user._id as any).toString());
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            token,
        });
    } catch (error: any) {
        console.error('Register Error Details:', {
            message: error.message,
            code: error.code,
        });

        if (error.code === 11000) {
            // Determine which field caused the duplicate
            const field = error.keyPattern?.email ? 'email' : error.keyPattern?.username ? 'username' : 'unknown';
            const msg = field === 'email' ? 'Email is already in use' : field === 'username' ? 'Username is already taken' : 'Duplicate entry';
            res.status(400).json({ message: msg, field });
            return;
        }

        res.status(500).json({
            message: 'Server error during registration',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email: identifier, password } = req.body;
    try {
        if (!identifier || !password) {
            res.status(400).json({ message: 'Email/Username and password are required' });
            return;
        }

        // Detect if input is email (contains @) or username
        const isEmail = identifier.includes('@');
        let user;

        if (isEmail) {
            // Case-insensitive email lookup
            user = await User.findOne({ email: identifier.toLowerCase() });
        } else {
            // Case-sensitive username lookup
            user = await User.findOne({ username: identifier });
        }

        if (!user) {
            const fieldType = isEmail ? 'email' : 'username';
            res.status(401).json({ message: `No account found with this ${fieldType}`, field: fieldType });
            return;
        }

        if (!user.password) {
            res.status(401).json({ message: 'This account uses Google Sign-In. Please log in with Google.', field: 'general' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Incorrect password', field: 'password' });
            return;
        }

        const token = generateToken((user._id as any).toString());
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
            token,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        // Expecting req.user to be populated by auth middleware (to be implemented)
        // For now, if no middleware, we can't get user.
        // Assuming auth middleware adds user to req.

        // Temporary: extract token from header manually if middleware not present yet
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await User.findById(decoded.id).select('-password'); // no password field but good practice
            if (user) {
                res.json(user);
                return;
            }
        }

        res.status(401).json({ message: 'Not authorized' });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
};


export const logout = (req: Request, res: Response) => {
    // Client side handles token removal
    res.status(200).json({ message: 'Logged out successfully' });
};
