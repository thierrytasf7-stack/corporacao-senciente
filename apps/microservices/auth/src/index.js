/**
 * Auth Microservice
 * 
 * Microservice de autenticação JWT reutilizável
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '..', 'config.json');

// Carregar configuração
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const SECRET = config.secret || process.env.JWT_SECRET || 'default-secret';
const EXPIRES_IN = config.expiresIn || '24h';

/**
 * Gera token JWT
 */
export function generateToken(payload, secret = SECRET) {
  return jwt.sign(payload, secret, { expiresIn: EXPIRES_IN });
}

/**
 * Autentica e valida token
 */
export function authenticate(token, secret = SECRET) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Token inválido');
  }
}

/**
 * Decodifica token sem validar
 */
export function decodeToken(token) {
  return jwt.decode(token);
}






























