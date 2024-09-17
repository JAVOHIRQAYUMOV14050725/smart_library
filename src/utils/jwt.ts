import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'default_refresh_secret';

interface JwtPayload {
    id?: number;
    email?: string;
    role?: string;
}


export const sign = (payload: JwtPayload, expiresIn: string | number = '1d'): string => {
    const modifiedPayload = {
        ...payload,
        id: payload.id ? payload.id.toString() : undefined,
    };

    return jwt.sign(modifiedPayload, SECRET_KEY, { expiresIn });
};

export const verify = (token: string): JwtPayload | null => {
    try {
        const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;

        return {
            ...payload,
            id: payload.id ? Number(payload.id) : undefined,
        };
    } catch (error) {
        console.error('Invalid token:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
};

export const signRefreshToken = (payload: JwtPayload, expiresIn: string | number = '7d'): string => {
    if (!REFRESH_SECRET_KEY) {
        throw new Error('REFRESH_SECRET_KEY muhit o\'zgaruvchisi mavjud emas');
    }

    const modifiedPayload = {
        ...payload,
        id: payload.id ? payload.id.toString() : undefined,
    };

    return jwt.sign(modifiedPayload, REFRESH_SECRET_KEY, { expiresIn });
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        if (!REFRESH_SECRET_KEY) {
            throw new Error('REFRESH_SECRET_KEY muhit o\'zgaruvchisi mavjud emas');
        }

        const payload = jwt.verify(token, REFRESH_SECRET_KEY) as JwtPayload;

        return {
            ...payload,
            id: payload.id ? Number(payload.id) : undefined,
        };
    } catch (error) {
        console.error('Invalid refresh token:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
};
