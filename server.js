require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());


// ======================
// MONGODB CONNECTION
// ======================

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("🟢 MongoDB Connected Successfully!");
})
.catch((err) => {
    console.log("🔴 MongoDB Connection Error:", err);
});


// ======================
// DATABASE SCHEMA
// ======================

const TopicSchema = new mongoose.Schema({
    id: Number,
    date: String,
    originDate: String,
    completionDate: String,

    category: String,
    subject: String,
    topicName: String,

    noteUrl: String,

    status: String,

    reviewsDone: [Number],

    reviewHistoryStamps: Object,

    customRevPendingOn: String,

    customReviewHistoryDates: [String]
});

const Topic = mongoose.model('Topic', TopicSchema);


// ======================
// GET ALL TOPICS
// ======================

app.get('/api/topics', async (req, res) => {

    try {

        const topics = await Topic.find({});

        const grouped = {};

        topics.forEach((topic) => {

            if (!grouped[topic.date]) {
                grouped[topic.date] = [];
            }

            grouped[topic.date].push(topic);

        });

        res.json(grouped);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// ======================
// SAVE / UPDATE TOPIC
// ======================

app.post('/api/topics/sync', async (req, res) => {

    try {

        const updatedTopic = await Topic.findOneAndUpdate(
            { id: req.body.id },
            req.body,
            {
                upsert: true,
                new: true
            }
        );

        res.json({
            success: true,
            data: updatedTopic
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// ======================
// DELETE TOPIC
// ======================

app.delete('/api/topics/:id', async (req, res) => {

    try {

        await Topic.deleteOne({
            id: req.params.id
        });

        res.json({
            success: true,
            message: "Topic Deleted Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// ======================
// HOME ROUTE
// ======================

app.get('/', (req, res) => {

    res.send(`
        <h1>🚀 Personal Routine Backend Running Successfully!</h1>
    `);

});


// ======================
// SERVER START
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Server Running On Port ${PORT}`);

});