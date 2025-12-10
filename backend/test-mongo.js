import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.DB_URL;

async function testConnection() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas!');
        
        const db = client.db('chatting_application');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections);
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        // Try to get more specific error
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n📌 This is an IP whitelisting issue.');
            console.log('Go to MongoDB Atlas → Network Access → Add IP Address');
            console.log('Add: 0.0.0.0/0 (allow all IPs)');
        }
        
    } finally {
        await client.close();
    }
}

testConnection();