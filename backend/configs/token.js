import jwt from 'jsonwebtoken'

const generateToken = async (user_id) => {
    try {
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        return token;
    } catch (error) {
        console.log(`Token generation error: ${error.message}`);
        throw error;
    }
}

const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.log(`Token verification error: ${error.message}`);
        throw error;
    }
}

export { generateToken, verifyToken };