"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
// Настройка CORS
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST']
}));
const server = http_1.default.createServer(app);
const socketApp = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // запросы с любого домена
        methods: ["GET", "POST"]
    }
});
app.get('/', (req, res) => {
    res.send("Hello, it's WS server");
});
const messages = [
// Ваши сообщения здесь
];
const usersState = new Map();
socketApp.on('connection', (socketChannel) => {
    usersState.set(socketChannel, { id: (0, uuid_1.v1)(), name: 'anonymous' });
    socketChannel.on('disconnect', () => {
        usersState.delete(socketChannel);
    });
    socketChannel.on('client-name-sent', (name) => {
        if (typeof name !== 'string') {
            return;
        }
        const user = usersState.get(socketChannel);
        if (user) {
            user.name = name;
        }
    });
    socketChannel.on('client-message-sent', (message) => {
        if (typeof message !== 'string') {
            return;
        }
        const user = usersState.get(socketChannel);
        if (user) {
            const messageItem = {
                message: message,
                id: (0, uuid_1.v1)(),
                user: { id: user.id, name: user.name }
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
//# sourceMappingURL=app.js.map