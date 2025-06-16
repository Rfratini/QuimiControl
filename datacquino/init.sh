#!/bin/bash
echo ''
echo "Criando configurações de inicialização da DATACQUINO..."
echo "Configure arquivo de configuração '.env' abaixo"
echo ''

echo ''
read -p "Deseja habilitar inserção final no banco de dados? (S/N) " HABILITAR
if [ $HABILITAR = 'S' ]; then INSERIR='true'
else INSERIR='false'
fi
echo ''

if [ $INSERIR = 'true' ]; then
echo ''
echo "Credenciais de acesso ao MySql Server"
read -p "Insira o ip do host: " HOST
read -p "Insira a porta do banco: " PORTA
read -p "Insira o user para inserção no banco: " USER
read -s -p "Insira a senha do user $USER: " SENHA
echo ''
read -p "Insira o database: " DATABASE
echo ''
fi

echo ''
echo 'Configurações de criação de dados'
read -p "Insira o id da empresa para inserção: " EMPRESA
read -p "Insira a quantidade de canteiros: " CANTEIROS
read -p "Insira a quantidade de sensores por canteiro: " SENSORES
echo ''

# Novas configurações de simulação
echo 'Configurações de simulação'
read -p "Deseja usar modo de simulação? (S/N) " SIMULAR
if [ $SIMULAR = 'S' ]; then 
    USAR_SIMULACAO='true'
    read -p "Intervalo entre leituras (ms): " INTERVALO
    read -p "Umidade mínima (%): " UMIDADE_MIN
    read -p "Umidade máxima (%): " UMIDADE_MAX
else 
    USAR_SIMULACAO='false'
    INTERVALO=5000
    UMIDADE_MIN=50
    UMIDADE_MAX=80
fi

cat > '.env' <<EOF
DB_HOST = '$HOST'
DB_USER = '$USER'
DB_SENHA = '$SENHA'
DB_DATABASE = '$DATABASE'
DB_PORT = $PORTA
ID_EMPRESA = $EMPRESA
QTD_CANTEIROS = $CANTEIROS
QTD_SENSORES = $SENSORES
OP_INSERIR = $INSERIR
USAR_SIMULACAO = $USAR_SIMULACAO
SIMULACAO_INTERVALO = ${INTERVALO:-5000}
SIMULACAO_UMIDADE_MIN = ${UMIDADE_MIN:-50}
SIMULACAO_UMIDADE_MAX = ${UMIDADE_MAX:-80}
EOF

echo ''
echo 'As credenciais configuradas são:'
echo '--------------------------------'
cat '.env'
echo '--------------------------------'

read -p "As credenciais estão corretas? (S/N) " INICIAR_API

echo ''
if [ $INICIAR_API = 'S' ]; then 
    echo 'INSTALANDO DEPENDÊNCIAS...'
    npm i
    echo ''
    echo 'INICIALIZANDO DATACQUINO...'
    npm start
else 
    echo 'RECONFIGURE AS CREDENCIAIS...'
    ./init.sh
fi