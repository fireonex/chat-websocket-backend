import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v1 as uuidv1 } from 'uuid';

type User = {
    id: string;
    name: string;
}

type Message = {
    message: string;
    id: string;
    user: User;
}

const app = express();

// Установка заголовков для CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://fireonex.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Настройка CORS
app.use(cors({
    origin: "https://fireonex.github.io",
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,

}));

app.options('*', cors()); // Обработка preflight-запросов

const server = http.createServer(app);
const socketApp = new Server(server, {
    cors: {
        origin: "https://fireonex.github.io",
        methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, it's WS server");
});

const messages: Message[] = [
    // Ваши сообщения здесь
];

const usersState = new Map<Socket, User>();

socketApp.on('connection', (socketChannel: Socket) => {
    usersState.set(socketChannel, {id: uuidv1(), name: 'anonymous'});

    socketChannel.on('disconnect', () => {
        usersState.delete(socketChannel);
    });

    socketChannel.on('client-name-sent', (name: string) => {
        if (typeof name !== 'string') {
            return;
        }
        const user = usersState.get(socketChannel);
        if (user) {
            user.name = name;
        }
    });

    socketChannel.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
            return;
        }

        const user = usersState.get(socketChannel);
        if (user) {
            const messageItem: Message = {
                message: message,
                id: uuidv1(),
                user: {id: user.id, name: user.name}
            };
            messages.push(messageItem);
            socketApp.emit('new-message-sent', messageItem);
        }
    });

    socketChannel.emit('init-messages-published', messages);
    console.log('a user connected');
});

const PORT = process.env.PORT || 3009;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
