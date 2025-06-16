var medidaModel = require("../models/medidaModel");

function buscarumidade(req, res) {
    var fk_empresa = req.params.fk_empresa;

    if (fk_empresa == undefined) {
        res.status(400).send("Seu fkEmpresa está undefined!");
    } else {
        usuarioModel.buscarumidade(fk_empresa)
            .then(
                function (resultado) {
                    res.json(resultado)
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            )
    }

}
function statussensor(req, res) {
    var fk_empresa = req.params.fk_empresa;
    var fk_setor = req.params.fk_setor;
    var fk_sensor = req.params.fk_sensor;

    if (fk_empresa == undefined) {
        res.status(400).send("Seu fkEmpresa está undefined!");
    } else if (fk_sensor == undefined) {
        res.status(400).send("Seu fkSensor está undefined!");
    } else if (fk_setor == undefined) {
        res.status(400).send("Seu fk_setor está undefined!");
    } else {
        medidaModel.statussensor(fk_empresa, fk_setor, fk_sensor)
            .then(
                function (resultado) {
                    res.json(resultado)
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            )
    }

}
function variacao24(req, res) {
    var fk_empresa = req.params.fk_empresa;
    var fk_setor = req.params.fk_setor;
    var fk_sensor = req.params.fk_sensor;

    if (fk_empresa == undefined) {
        res.status(400).send("Seu fkEmpresa está undefined!");
    } else if (fk_sensor == undefined) {
        res.status(400).send("Seu fkSensor está undefined!");
    } else if (fk_setor == undefined) {
        res.status(400).send("Seu fk_setor está undefined!");
    } else {
        medidaModel.variacao24(fk_empresa, fk_setor, fk_sensor)
            .then(
                function (resultado) {
                    res.json(resultado)
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            )
    }

}
function buscaralertasdasemana(req, res) {
    var fk_empresa = req.params.fk_empresa;
    var fk_setor = req.params.fk_setor;
    var fk_sensor = req.params.fk_sensor;

    if (fk_empresa == undefined) {
        res.status(400).send("Seu fkEmpresa está undefined!");
    } else if (fk_sensor == undefined) {
        res.status(400).send("Seu fkSensor está undefined!");
    } else if (fk_setor == undefined) {
        res.status(400).send("Seu fk_setor está undefined!");
    } else {
        medidaModel.buscaralertasdasemana(fk_empresa, fk_setor, fk_sensor)
            .then(
                function (resultado) {
                    res.json(resultado)
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            )
    }

}

module.exports = {
    buscarumidade,
    statussensor,
    variacao24,
    buscaralertasdasemana
}