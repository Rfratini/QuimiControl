// importa os bibliotecas necessários
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
require("dotenv").config();

// constantes para configurações
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

let HABILITAR_OPERACAO_INSERIR;
process.env.OP_INSERIR == 'true' ? HABILITAR_OPERACAO_INSERIR = true : HABILITAR_OPERACAO_INSERIR = false;

function simularLeiturasSensores() {
    const quantidadeDeSetores = process.env.QTD_Setores || 8;
    const quantidadeDeSensoresPorSetor = process.env.QTD_SENSORES || 3;
    const idEmpresa = process.env.ID_EMPRESA || 1;
    const umidadeMin = parseInt(process.env.SIMULACAO_UMIDADE_MIN) || 50;
    const umidadeMax = parseInt(process.env.SIMULACAO_UMIDADE_MAX) || 80;
    
    const valoresSensorCapacitivo = {};
    let valuesInsercao = '';

    for (let fkSetor = 1; fkSetor <= quantidadeDeSetores; fkSetor++) {
        valoresSensorCapacitivo[`Setor${fkSetor}`] = {};

        for (let fkSensor = 1; fkSensor <= quantidadeDeSensoresPorSetor; fkSensor++) {
            const valorCapturaVirtual = Math.floor(Math.random() * (umidadeMax - umidadeMin + 1)) + umidadeMin;

            valoresSensorCapacitivo[`Setor${fkSetor}`][`sensor${fkSensor}`] = valorCapturaVirtual;

            let conjuntoValores = `(${idEmpresa}, ${fkSetor}, ${fkSensor}, ${valorCapturaVirtual})`;

            if (fkSetor == quantidadeDeSetores && fkSensor == quantidadeDeSensoresPorSetor) {
                valuesInsercao += `${conjuntoValores}`;
            } else {
                valuesInsercao += `${conjuntoValores}, `;
            }
        }
    }

    return {
        valores: valoresSensorCapacitivo,
        query: `INSERT INTO leitura (fkEmpresa, fkSetor, fkSensor, umidadeSolo) VALUES ${valuesInsercao};`
    };
}

// função para comunicação serial
const serial = async (valoresSensorCapacitivo) => {
    // conexão com o banco de dados MySQL
    let poolBancoDados = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_SENHA,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    }).promise();

    if (process.env.USAR_SIMULACAO === 'true') {
        console.log('Usando modo de simulação - gerando dados aleatórios');
        const intervalo = parseInt(process.env.SIMULACAO_INTERVALO) || 5000;
        
        setInterval(async () => {
            const { valores, query } = simularLeiturasSensores();
            Object.assign(valoresSensorCapacitivo, valores);
            
            if (HABILITAR_OPERACAO_INSERIR) {
                try {
                    await poolBancoDados.execute(query);
                    console.log("Valores simulados inseridos no banco com sucesso!");
                    console.log(valores);
                } catch (error) {
                    console.error("Erro ao inserir valores simulados:", error);
                }
            }
        }, intervalo);

    } else {
        // Modo normal com Arduino
        console.log('Usando modo de leitura do Arduino');
        
        // lista as portas seriais disponíveis e procura pelo Arduino
        const portas = await serialport.SerialPort.list();
        const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
        
        if (!portaArduino) {
            throw new Error('O arduino não foi encontrado em nenhuma porta serial');
        }

        // configura a porta serial com o baud rate especificado
        const arduino = new serialport.SerialPort({
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        });

        arduino.on('open', () => {
            console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
        });

        // processa os dados recebidos do Arduino
        arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
            console.log('-----------------------------------------------------');
            console.log(`Valor captado: ${data}\n`);
            const valores = data.split(';');
            const sensorCapacitivo = parseInt(valores[0]);
            const idEmpresa = process.env.ID_EMPRESA;
            const quantidadeDeSetores = process.env.QTD_SETORES;
            const quantidadeDeSensoresPorSetores = process.env.QTD_SENSORES;

            let valuesInsercao = '';
            for (let fkSetor = 1; fkSetor <= quantidadeDeSetores; fkSetor++) {
                valoresSensorCapacitivo[`Setor${fkSetor}`] = {};
                for (let fkSensor = 1; fkSensor <= quantidadeDeSensoresPorSetores; fkSensor++) {
                    const modificador = Math.random();
                    let valorCapturaVirtual;

                    modificador > 2 / 3 ?
                        valorCapturaVirtual = (sensorCapacitivo + (parseInt(Math.random().toFixed()) + 1)) :
                        modificador > 1 / 3 ?
                            valorCapturaVirtual = (sensorCapacitivo - (parseInt(Math.random().toFixed()) + 1)) :
                            valorCapturaVirtual = sensorCapacitivo
                        ;

                    valoresSensorCapacitivo[`Setor${fkSetor}`][`sensor${fkSensor}`] = valorCapturaVirtual;

                    let conjuntoValores = `(${idEmpresa}, ${fkSetor}, ${fkSensor}, ${valorCapturaVirtual})`

                    if (fkSetor == quantidadeDeSetores && fkSensor == quantidadeDeSensoresPorSetores) {
                        valuesInsercao += `${conjuntoValores}`;
                    } else {
                        valuesInsercao += `${conjuntoValores}, `;
                    }
                }
            }
            
            if (HABILITAR_OPERACAO_INSERIR) {
                await poolBancoDados.execute(
                    `INSERT INTO leitura (fkEmpresa, fkSetor, fkSensor, umidadeSolo) VALUES ${valuesInsercao};`
                );
                console.log("Valores inseridos no banco com sucesso!\n", valoresSensorCapacitivo);
                console.log('-----------------------------------------------------');
            }
        });

        // evento para lidar com erros na comunicação serial
        arduino.on('error', (mensagem) => {
            console.error(`Erro no arduino (Mensagem: ${mensagem}`)
        });
    }
};

// função para criar e configurar o servidor web
const servidor = (valoresSensorCapacitivo) => {
    const app = express();

    // configurações de requisição e resposta
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });

    // inicia o servidor na porta especificada
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });

    // define os endpoints da API para cada tipo de sensor
    app.get('/sensores/analogico', (_, response) => {
        return response.json(valoresSensorCapacitivo);
    });
};

// função principal assíncrona para iniciar a comunicação serial e o servidor web
(async () => {
    // arrays para armazenar os valores dos sensores
    const valoresSensorCapacitivo = {};

    // inicia a comunicação serial
    await serial(valoresSensorCapacitivo);

    // inicia o servidor web
    servidor(valoresSensorCapacitivo);
})();