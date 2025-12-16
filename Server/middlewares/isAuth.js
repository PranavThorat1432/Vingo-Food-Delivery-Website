import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required: No token provided'
            });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
            req.userId = decoded.userId;
            next();
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Authentication error: ${error.message}`
        });
    }
};

export default isAuth;