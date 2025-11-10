import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Kiểm tra Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Thiếu token xác thực!' 
      });
    }

    // Lấy token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token không hợp lệ!' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { 
      id: decoded.userId, 
      username: decoded.username 
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token đã hết hạn!' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token không hợp lệ!' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Xác thực thất bại!' 
    });
  }
};