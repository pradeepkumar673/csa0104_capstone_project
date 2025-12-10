import mongoose from 'mongoose';

const database = async() => {
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("database connect aidichi da");
    }
    catch(error){
        console.log(`database connect avala bcoz ${error}`);

    }
}

export default database;