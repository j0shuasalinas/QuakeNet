import express from 'express';
const app=express(); app.get('/api/health',(_req,res)=>res.json({ok:true,mode:'demo'})); app.listen(Number(process.env.PORT||3001),'0.0.0.0');
