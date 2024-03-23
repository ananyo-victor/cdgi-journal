import jwt from "jsonwebtoken";
const JWT_secret = "s0//P4$$w0rD";

const fetchuser = async (req, res, next) => {
    
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error : "Please enter valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_secret);
        req.user = data.user;
    } catch (error) {
        res.status(401).send({error : "Please enter valid token"});
    }
    next();
  };

export default fetchuser;