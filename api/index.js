const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://venta-omega.vercel.app/cartera';

app.get('/', (req, res) => {
    res.json({ status: "ok", message: "Microservicio activo" });
});

app.get('/api', (req, res) => {
    res.json({
        mensaje: "Bienvenido al Microservicio de Cartera",
        endpoints: ["/api/clientes", "/api/resumen"]
    });
});

app.get('/api/clientes', async (req, res) => {
    try {
        const response = await axios.get(EXTERNAL_API_URL);
        res.json({
            status: "success",
            count: response.data.length,
            data: response.data
        });
    } catch (error) {
        res.status(502).json({ status: "error", message: "API externa inalcanzable" });
    }
});

app.get('/api/resumen', async (req, res) => {
    try {
        const response = await axios.get(EXTERNAL_API_URL);
        const data = response.data;
        const totalDeuda = data.reduce((sum, item) => sum + parseFloat(item.deuda || 0), 0);
        res.json({
            status: "success",
            resumen: {
                total_clientes: data.length,
                deuda_total: totalDeuda.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error procesando datos" });
    }
});

// Endpoint propio 3: Actualizar una deuda (PUT)
app.get('/api/clientes/:id', (req, res) => res.status(405).json({ error: "Usa el método PUT para actualizar" }));

app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, deuda } = req.body;

    if (!nombre || deuda === undefined) {
        return res.status(400).json({ status: "error", message: "Faltan datos (nombre o deuda)" });
    }

    try {
        const response = await axios.put(`${EXTERNAL_API_URL}/${id}`, { nombre, deuda });
        res.json({
            status: "success",
            message: `Cliente ${id} actualizado correctamente`,
            data: response.data
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        res.status(error.response?.status || 500).json({
            status: "error",
            message: "No se pudo actualizar la deuda",
            detail: error.message
        });
    }
});

module.exports = app;
