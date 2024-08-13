import express, {name, Request, Response} from 'express';
import http from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {v1} from "uuid";

const app = express();

// Настройка CORS
app.use(cors({
    origin: '*', // Замените * на домен фронтенда, если он известен
    methods: ['GET', 'POST']
}));

const server = http.createServer(app);
const socketApp = new Server(server, {
    cors: {
        origin: "*", // Разрешите запросы с любого домена
        methods: ["GET", "POST"]
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, it's WS server");
});

const messages = [
    // {message: 'Hello', id: 'fgjwh', user: {id: 'fghjkldd', name: 'Kataerel'}},
    // {message: 'Hello K!', id: 'fgjrjsh', user: {id: 'fg4545kldd', name: 'Sam'}},
    // {message: 'Hello Kata!', id: 'fgjrttjsh', user: {id: 'fg4545kldd', name: 'Sam'}},
]

const usersState = new Map( )

socketApp.on('connection', (socketChannel: Socket) => {
    usersState.set(socketChannel, {id: v1(), name: 'anonymous'})
    socketApp.on('disconnect', () => {
        usersState.delete(socketChannel)
    })
    socketChannel.on('client-name-sent', (name: string) => {

        if (typeof name !== 'string') {
            return
        }

        const user = usersState.get(socketChannel)
        user.name = name
    })

    socketChannel.on('client-message-sent', (message) => {
        if (typeof message !== 'string') {
            return
        }

        const user = usersState.get(socketChannel)

        let messageItem = {
            message: message, id: v1(), user: {id: user.id, name: user.name}
        }
        messages.push(messageItem)
        socketApp.emit('new-message-sent', messageItem)
    });

    socketChannel.emit('init-messages-published', messages)
    console.log('a user connected');
});

const PORT = process.env.PORT || 3009;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
