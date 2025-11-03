import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { access } from 'fs';
import { serialize } from 'cookie';
import path from 'path';
import RefreshToken from '../models/RefreshToken';



const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('Missing token secrets in environment variables');
}

// Create JWT access token (short lived)
export function createAccessToken(userId: string, role: string) {
    return jwt.sign({ sub: userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}


// verify access token
export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);

}

// raw refresh token generator
export function generateRawRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

// hashed refresh token generator from raw token
export function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}


export function setRefreshCookieHeader(resHeaders: Headers, rawToken: string, days: Number) {
    const options: any = {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: <any>days * 24 * 60 * 60,


    }
    const cookies = serialize('refreshToken', rawToken, options);
    resHeaders.append('Set-Cookie', cookies);

}

// clear refresh token cookie

export function clearRefreshCookieHeader(resHeaders: Headers) {
    const options: any = {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 0,
    }
    const cookies = serialize('refreshToken', '', options);
    resHeaders.append('Set-Cookie', cookies);
}

// save hashed token to db
export async function saveRefreshToken(userId: string, rawRefreshToken: string, ip?: string, ua?: string, days = 7) {
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const docRefToken = await RefreshToken.create({
        tokenHash,
        ip,
        userAgent: ua,
        userId,
        expiresAt,
    })

    return docRefToken;
}

// FInd refresh token by its hash from raw token
export async function findRefreshTokenByRaw(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    return RefreshToken.findOne({ tokenHash });
}

// Revoke (delete) a refresh token by raw value
export async function revokeRefreshTokenByRaw(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    await RefreshToken.deleteOne({ tokenHash });
}