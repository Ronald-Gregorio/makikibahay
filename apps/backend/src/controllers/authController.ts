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
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            email,
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
        });

        const token = generateToken((user._id as any).toString());
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials. Please attempt Google Login if you registered via OAuth.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
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
