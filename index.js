const express = require("express");
const mongoose = require('mongoose');
const session = require("express-session");
const redis = require("redis");
const cors =require("cors");
const { 
    MONGO_USER,
    MONGO_PASSWORD, 
    MONGO_PORT, 
    MONGO_IP, 
    SESSION_SECRET,
    REDIS_URL,
    REDIS_PORT
} =require("./config/config");


let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL=`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

//-----------------------------------------------------------
const connectWithRetry = () => {
    mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log("Successfully connected to DB"))
    .catch((e) => {
        console.log(e);
        setTimeout(connectWithRetry, 5000)
    });
}; 

connectWithRetry();
app.enable("trust proxy");

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninizialized: false,
        httpOnly: true,     
        maxAge: 30000,
    },
}));    // MIDDLEWARE 
app.use(express.json());   // MIDDLEWARE 
app.use(cors());

//localhost:3000/
app.get("/api/v1", (req,res) => {
    res.send("<h1>Hi there !!!! hey - It is already running</h1>");
    console.log("yeah it run");
});

//localhost:3000/api/v1/posts/
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port ${port}'));