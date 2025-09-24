import express from 'express';
import morgan from 'morgan'; import cors from 'cors';
const app = express(); const PORT = process.env.PORT || 3002;
app.use(cors()); app.use(morgan('dev')); app.use(express.json());
const products = [{id:101,name:'Laptop',price:79999},{id:102,name:'Phone',price:49999}];
app.get('/health', (_req,res)=>res.json({ok:true,service:'products'}));
app.get('/products', (_req,res)=>res.json(products));
app.listen(PORT, ()=>console.log(`products service on ${PORT}`));