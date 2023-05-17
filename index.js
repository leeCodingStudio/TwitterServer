import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import tweetsRouter from './router/tweets.js'
import authRouter from './router/auth.js'
import {config} from './config.js' 
/*import {Server} from 'socket.io'*/
import {initSocket} from './connection/socket.js'
import { sequelize } from './db/database.js'
// import {db} from "./db/database.js";

const app = express()
const corsOprtion = {
    origin: config.cors.allowedOrigin,
    optionsSuccessStatus: 200
}
//미들웨어 
app.use(express.json())  
app.use(cors(corsOprtion))
app.use(morgan('tiny'))  // 사용자들이 접속하면 log를 콘솔에 찍음(HTTP 요청 로깅을 간단하게 처리하고자 할 때 사용)

// router
app.use('/tweets', tweetsRouter)
app.use('/auth', authRouter)

app.use((req, res, next) => {
    res.sendStatus(404)
})

// 서버에러
app.use((error, req, res, next) => {
    console.log(error)
    res.sendStatus(500)
});

// db.getConnection().then((connection)=>console.log(connection));

sequelize.sync().then(() => {
    console.log(`서버가 시작되었음 : ${new Date()}`);
    const server = app.listen(config.host.port);
    initSocket(server);
});



/*const server = app.listen(config.host.port);
const socketIo = new Server(server, {
    cors:{
        origin: "*"
    }
});

socketIo.on('connection',() =>{
    console.log('클라이언트 연결성공!');
    socketIo.emit('dwitter','Hello ❤️');
});

setInterval(() => {
    socketIo.emit('dwitter','hello❤️❤️❤️❤️');
},1000);*/
