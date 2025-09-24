import express from 'express';
import morgan from 'morgan'; import cors from 'cors';
const app = express(); const PORT = process.env.PORT || 3001;
app.use(cors()); app.use(morgan('dev')); app.use(express.json());
const users = [{id:1,name:'Alice',email:'alice@example.com'},{id:2,name:'Bob',email:'bob@example.com'}];
app.get('/health', (_req,res)=>res.json({ok:true,service:'users'}));
app.get('/users', (_req,res)=>res.json(users));
app.listen(PORT, ()=>console.log(`users service on ${PORT}`));