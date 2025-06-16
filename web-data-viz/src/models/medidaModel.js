var database = require("../database/config");

function buscarumidade(fk_empresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", fk_empresa);

    var instrucaoSql = `
       select idLeitura,umidadeSolo,statusAtivacao from leitura as l  join sensor as s on (l.fkSensor, l.fkSetor, l.fkEmpresa) = (s.idSensor, s.fkSetor, s.fkEmpresa)
        where l.fkEmpresa = '${fk_empresa}'ORDER BY l.idLeitura desc limit 24;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function statussensor(fk_empresa, fk_Setor, fk_sensor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", fk_empresa, fk_sensor, fk_Setor);

    var instrucaoSql = `
       select s.statusAtivacao from sensor as s join Setor as c 
        on c.idSetor = s.fkSetor
        join empresa as e
        on e.idEmpresa = c.fkEmpresa
        where s.fkEmpresa = '${fk_empresa}' and s.idSensor = '${fk_sensor}' and s.fkSetor = '${fk_Setor}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function variacao24(fk_empresa, fk_Setor, fk_sensor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", fk_empresa, fk_sensor, fk_Setor);

    var instrucaoSql = `
       select truncate((max(umidadeSolo) - min(umidadeSolo)),1) as 'variacao' from leitura as l join sensor as s
        on l.fkSensor = s.idSensor
        join Setor as c
        on c.idSetor = s.fkSetor
        join empresa as e
        on e.idEmpresa = c.fkEmpresa
        where s.idSensor = '${fk_sensor}' and l.FkSetor = '${fk_Setor}' and l.FkEmpresa = '${fk_empresa}' and dtColeta >= NOW() - INTERVAL 1 DAY;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscaralertasdasemana(fk_empresa, fk_Setor, fk_sensor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", fk_empresa, fk_sensor, fk_Setor);

    var instrucaoSql = `
       select count(idAlerta) as 'qtdAlerta' from alerta as a join leitura as l
        on a.fkLeitura = l.idLeitura
        join sensor as s
        on s.idSensor = l.fkSensor
        join Setor as c
        on c.idSetor = s.fkSetor
        join empresa as e
        on e.idEmpresa = c.fkEmpresa
        where s.idSensor = '${fk_sensor}' and c.idSetor = '${fk_Setor}' and e.idEmpresa = '${fk_empresa}' and dtAlerta >= NOW() - INTERVAL 7 DAY;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarumidade, 
    statussensor,
    variacao24,
    buscaralertasdasemana
}
