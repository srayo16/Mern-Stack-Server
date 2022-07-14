const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const options = {
    auth: {
        api_key: process.env.SENDGRID_API
    }
}
const emailClient = nodemailer.createTransport(sgTransport(options));

app.use(cors());
app.use(express.json());

function sendMailToClient(mail, code) {

    const email = {
        from: process.env.MY_MAIL,
        to: mail,
        subject: 'Your OTP is here',
        text: 'Your OTP is here',
        html: `
        <div>
        <h2>Hello</h2>
        <p><strong>Your otp is ${code}.</strong> Please use this otp code to verify your mail.</p>
        <p>Thank you</p>
        </div>
        `
    };

    emailClient.sendMail(email, function (err, info) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Message sent: ', info);
        }
    });
}
// function between(min, max) {
//     return Math.floor(
//         Math.random() * (max - min) + min
//     )
// }
// console.log(
//     between(1000, 9999)
// )
// let otp = crypto.randomInt(1000, 9999);
// console.log(otp);
// console.log(otp);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrchc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db("emails").collection("clients");
        const databaseTwo = client.db("emails").collection("clientsDetails");

        app.post('/sendEmail', async (req, res) => {
            const email = req.body;
            console.log(email);
            // let getOtp = otp;
            let emailOrigin = email?.getEmail;
            let getOtp = email?.getOtp;
            console.log(emailOrigin);
            const doc = { emailOrigin, getOtp };
            sendMailToClient(emailOrigin, getOtp);
            const sendingData = await database.insertOne(doc);
            // console.log(otp, email);
            res.send(sendingData);

        })

        app.post('/info', async (req, res) => {
            const doc = req.body;
            const insertData = await databaseTwo.insertOne(doc);
            res.send(insertData);
        })

        app.get('/clients', async (req, res) => {
            const result = await database.find().toArray();
            res.send(result);
        })
        app.get('/verifyOtpEmail', async (req, res) => {
            const emailOrigin = req.query.emailOrigin;
            const query = { emailOrigin: emailOrigin };
            const getData = await database.find(query).toArray();
            res.send(getData);
        })
    } finally {
    }
}

run().catch(console.dir);











app.post('/email', (req, res) => {
    // sendMailToClient();
    res.send({ success: true });
})

app.get('/', (req, res) => {
    res.send('Server is running');
})
app.listen(port, () => {
    console.log('Listening to port', port);
})