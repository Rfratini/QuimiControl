var express = require("express");
var router = express.Router();

var medidaController = require("../controllers/medidaController");

router.get(`/buscarumidade/:fk_empresa`, function (req,res) {
    medidaController.buscarumidade(req,res);
});

router.get(`/statussensor/:fk_empresa/:fk_setor/:fk_sensor`, function (req,res) {
    medidaController.statussensor(req,res);
});

router.get(`/variacao24/:fk_empresa/:fk_setor/:fk_sensor`, function (req,res) {
    medidaController.variacao24(req,res);
});

router.get(`/buscaralertasdasemana/:fk_empresa/:fk_setor/:fk_sensor`, function (req,res) {
    medidaController.buscaralertasdasemana(req,res);
});

module.exports = router;