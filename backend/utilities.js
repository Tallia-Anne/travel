const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // No token unauthorized
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // Token error
    if (err) return res.status(401).json({ error: true, message: 'Invalid token' });
    
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
