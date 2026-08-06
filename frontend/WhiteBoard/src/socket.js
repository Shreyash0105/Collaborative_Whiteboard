import { io } from 'socket.io-client';

// Connect to your backend port
const URL = process.env.REACT_APP_API_URL.replace('/api', ''); 
export const socket = io(URL);