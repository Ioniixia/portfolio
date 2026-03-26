// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME || 'poornima-portfolio';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection (Native driver)
const client = new MongoClient(process.env.MONGO_URI);
let isMongoConnected = false;

async function connectDB() {
    try {
        await client.connect();
        isMongoConnected = true;
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        isMongoConnected = false;
        console.error('❌ MongoDB connection error:', err);
    }
}

// Routes
app.get('/api/projects', (req, res) => {
    const projects = [
        { title: "TaskFlow", desc: "Real-time collaborative task manager", tech: "Node.js + MongoDB" },
        { title: "EcomSwift", desc: "Modern e-commerce platform", tech: "Express + MongoDB" },
        { title: "Blogify", desc: "Clean blogging platform", tech: "MERN Stack" }
    ];
    res.json(projects);
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!isMongoConnected) {
            await connectDB();
            if (!isMongoConnected) {
                return res.status(503).json({ success: false, message: "Database unavailable. Please try again." });
            }
        }

        const db = client.db(DB_NAME);
        const collection = db.collection('contacts');

        await collection.insertOne({
            name,
            email,
            message,
            createdAt: new Date()
        });

        console.log(`📨 New contact from ${name} (${email})`);
        res.json({ success: true, message: "Message saved successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Serve frontend for all other routes (Express 5 wildcard syntax)
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    connectDB();
});