import { config } from './env';

export const authConfig = {
    jwt: {
        secret: config.jwt.secret,
        expiresIn: config.jwt.expiresIn,
        issuer: 'campus-os-api',
        audience: 'campus-os-client',
    },
    bcrypt: {
        saltRounds: 10,
    },
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
    },
};
