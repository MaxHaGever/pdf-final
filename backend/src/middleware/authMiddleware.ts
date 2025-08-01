import { Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthenticateRequest extends Request {
    userId?: string;
}

export const protect = (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'No token'});
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as {userId: string};
        req.userId = decoded.userId;
        next();
    } catch(error){
        return res.status(401).json({message: 'Invalid Token'})
    }
};