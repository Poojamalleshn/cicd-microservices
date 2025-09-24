import express from 'express';
import morgan from 'morgan'; import cors from 'cors';
const app = express(); const PORT = process.env.PORT || 3003;
app.use(cors()); app.use(morgan('dev')); app.use(express.json());
let orders=[{id:5001,userId:1,productId:101,status:'PLACED'},{id:5002,userId:2,productId:102,status:'SHIPPED'}];
app.get('/health', (_req,res)=>res.json({ok:true,service:'orders'}));
app.get('/orders', (_req,res)=>res.json(orders));
app.post('/orders', (req,res)=>{const o={id:Date.now(),...req.body,status:'PLACED'};orders.push(o);res.status(201).json(o)});
app.listen(PORT, ()=>console.log(`orders service on ${PORT}`));