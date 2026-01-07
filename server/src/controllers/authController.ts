import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            res.status(409).json({ error: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await UserModel.create(username, hashedPassword);

        const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: userId, username }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await UserModel.findByUsername(username);
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, avatar: user.avatar }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
