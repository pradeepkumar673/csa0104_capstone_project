import jwt from 'jsonwebtoken'
const gentoken = async (user_id)=>{
    try{
        const token = jwt.sign({user_id},process.env.JWT_SECRET,{expiresIn:"30d"});
        return token;
    }
    catch(error){
        console.log(`token la error iruku, itho ithu than ${error.message}`);
    }
}
export default gentoken;