import express from 'express';
import morgan from 'morgan'; import cors from 'cors';
const app = express(); const PORT = process.env.PORT || 3004;
app.use(cors()); app.use(morgan('dev')); app.use(express.json());
let payments=[{id:9001,orderId:5001,amount:79999,status:'PAID'},{id:9002,orderId:5002,amount:49999,status:'PENDING'}];
app.get('/health', (_req,res)=>res.json({ok:true,service:'payments'}));
app.get('/payments', (_req,res)=>res.json(payments));
app.post('/payments', (req,res)=>{const p={id:Date.now(),...req.body,status:'PAID'};payments.push(p);res.status(201).json(p)});
app.listen(PORT, ()=>console.log(`payments service on ${PORT}`));