import io from 'socket.io-client';

const URL = process.env.MATCHING_SERVICE_CORS || "http://localhost:3002"

export const socket = io(URL);

