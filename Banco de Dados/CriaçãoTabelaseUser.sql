drop database if exists QuimiControl;
create database QuimiControl;

use QuimiControl;

CREATE TABLE empresa (
	id INT PRIMARY KEY AUTO_INCREMENT,
	razao_social VARCHAR(50),
	cnpj CHAR(14),
	codigo_ativacao VARCHAR(50)
);

CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50),
	email VARCHAR(50),
	senha VARCHAR(50),
	fk_empresa INT,
	FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

CREATE TABLE setor (
    idCanteiro INT           AUTO_INCREMENT,
    fkEmpresa  INT,
    descricao  VARCHAR (80),
    dtCriacao  DATETIME      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pkCompostaCanteiro PRIMARY KEY (idCanteiro,fkEmpresa),
    CONSTRAINT fkCanteiroEmpresa FOREIGN KEY (fkEmpresa) REFERENCES empresa(id)
);

CREATE TABLE sensor (
    idSensor        INT       AUTO_INCREMENT,
    fkEmpresa       INT,
    fkCanteiro      INT,
    statusAtivacao  TINYINT   NOT NULL,
    dtInstalacao    DATETIME  NOT NULL,
    
    CONSTRAINT pkCompostaSensor PRIMARY KEY (idSensor, fkEmpresa, fkCanteiro),  
	CONSTRAINT fkSensorCanteiro FOREIGN KEY sensor(fkCanteiro) REFERENCES setor(idCanteiro),
    CONSTRAINT fkSensorEmpresa FOREIGN KEY sensor(fkEmpresa) REFERENCES empresa(id),
    CONSTRAINT ckStatus CHECK (statusAtivacao in (0,1))
);

CREATE TABLE leitura (
    idLeitura    INT       AUTO_INCREMENT,
    fkSensor     INT,
    fkEmpresa    INT,
    fkCanteiro   INT,
    umidadeSolo  FLOAT     NOT NULL,
    dtColeta     DATETIME  DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pkCompostaLeitura PRIMARY KEY (idLeitura, fkSensor, fkEmpresa, fkCanteiro),
    CONSTRAINT fkLeituraCanteiro FOREIGN KEY (fkCanteiro) REFERENCES sensor(fkCanteiro),
    CONSTRAINT fkLeituraSensor FOREIGN KEY (fkSensor) REFERENCES sensor(idSensor),
    CONSTRAINT fkLeituraEmpresa FOREIGN KEY (fkEmpresa) REFERENCES sensor(fkEmpresa)
) AUTO_INCREMENT = 100;

CREATE TABLE alerta (
    idAlerta    INT       AUTO_INCREMENT,
    fkSensor    INT,
    fkEmpresa   INT,
    fkCanteiro  INT,
    fkLeitura   INT,
    dtAlerta    DATETIME  DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pkCompostaAlerta PRIMARY KEY(idAlerta, fkLeitura, fkSensor, fkEmpresa, fkCanteiro),
    CONSTRAINT fkAlertaCanteiro FOREIGN KEY (fkCanteiro) REFERENCES sensor(fkCanteiro),
    CONSTRAINT fkAlertaSensor FOREIGN KEY (fkSensor) REFERENCES sensor(idSensor),
    CONSTRAINT fkAlertaEmpresa FOREIGN KEY (fkEmpresa) REFERENCES sensor(fkEmpresa),
    CONSTRAINT fkAlertaLeitura FOREIGN KEY (fkLeitura) REFERENCES leitura(idLeitura)
);

DROP USER IF EXISTS webdataviz;
CREATE USER 'webdataviz'@'%' IDENTIFIED BY 'Webdataviz#123.';
GRANT ALL PRIVILEGES ON QuimiControl.* TO 'webdataviz'@'%';

flush privileges;

DELIMITER $$
DROP TRIGGER IF EXISTS TG_after_data_insert_alert;
CREATE TRIGGER TG_after_data_insert_alert 
    AFTER INSERT ON leitura FOR EACH ROW 
	BEGIN 
		IF (NEW.umidadeSolo>20 OR NEW.umidadeSolo<15) THEN
			INSERT INTO alerta (fkSensor, fkEmpresa, fkCanteiro, fkLeitura) VALUES (NEW.fkSensor, NEW.fkEmpresa, NEW.fkCanteiro, NEW.idLeitura);
		END IF;
    END;$$
DELIMITER ;



