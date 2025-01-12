
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

const url = "mongodb+srv://vivek---chandra:vivek4040@vivek---chandra.qxeu6.mongodb.net/?retryWrites=true&w=majority&appName=vivek---chandra";
const client = new MongoClient(url);

let con;
client.connect()
    .then(connection => {
        console.log("Connected to MongoDB Atlas");
        con = connection; // Store connection
    })
    .catch(err => console.error("Error connecting to MongoDB:", err));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(1337, () => {
    console.log("Server running on http://localhost:1337");
});

app.get('/', (req, res) => {
    res.render('index', { message: null });
});

app.post('/result', async function(req, res) {
    if (!con) {
        return res.send("Database connection is not ready yet. Please try again later.");
    }

    const rollNumber = req.body.rollNumber;

    try {
        const db = con.db('results_portal');
        const student = await db.collection('results').findOne({ rollNumber: rollNumber });

        if (student) {
            let totalMarks = 0;
            const subjectCount = student.subjects.length;

            student.subjects.forEach(subject => {
                totalMarks += subject.marks;
            });

            const gpa = totalMarks / (subjectCount*10);

            res.render('result', { student, totalMarks, gpa });
        } else {
            res.render('index', { message: "Student not found. Please try again." });
        }
    } catch (error) {
        console.error("Error querying the database:", error);
        res.send("An error occurred while fetching the result.");
    }
});
