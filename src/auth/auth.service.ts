import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  generateToken() {
    return uuidv4();
  }

  // TODO: Implement addTokenToLocals once more routes are added
  async addTokenToLocals(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer') {
      throw new Error('Invalid token type');
    }

    res.locals.token = token;
    next();
  }
}

const authService = new AuthService();
export default authService;
