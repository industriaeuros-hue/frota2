const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase via Variáveis de Ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Obter os veículos direto do Supabase
app.get('/api/vehicles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('app_state')
            .select('*')
            .eq('id', 'main_data')
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora se a linha ainda não existir
            throw error;
        }

        // Retorna os dados salvos ou um array vazio se for a primeira vez
        res.json(data ? data.payload : []);
    } catch (err) {
        console.error('Erro ao buscar dados do Supabase:', err);
        res.status(500).json({ error: 'Erro ao ler banco de dados' });
    }
});

// Salvar/Atualizar os veículos no Supabase de forma permanente
app.post('/api/vehicles', async (req, res) => {
    try {
        const vehiclesData = req.body;

        const { error } = await supabase
            .from('app_state')
            .upsert({ 
                id: 'main_data', 
                payload: vehiclesData 
            });

        if (error) throw error;
        res.json({ message: 'Dados salvos com sucesso no Supabase!' });
    } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});