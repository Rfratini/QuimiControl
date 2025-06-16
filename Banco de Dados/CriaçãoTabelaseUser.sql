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
    idSetor INT           AUTO_INCREMENT,
    fkEmpresa  INT,
    descricao  VARCHAR (80),
    dtCriacao  DATETIME      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pkCompostaSetor PRIMARY KEY (idSetor,fkEmpresa),
    CONSTRAINT fkSetorEmpresa FOREIGN KEY (fkEmpresa) REFERENCES empresa(id)
);

CREATE TABLE sensor (
    idSensor        INT       AUTO_INCREMENT,
    fkEmpresa       INT,
    fkSetor      INT,
    statusAtivacao  TINYINT   NOT NULL,
    dtInstalacao    DATETIME  NOT NULL,
    
    CONSTRAINT pkCompostaSensor PRIMARY KEY (idSensor, fkEmpresa, fkSetor),  
	CONSTRAINT fkSensorSetor FOREIGN KEY sensor(fkSetor) REFERENCES setor(idSetor),
    CONSTRAINT fkSensorEmpresa FOREIGN KEY sensor(fkEmpresa) REFERENCES empresa(id),
    CONSTRAINT ckStatus CHECK (statusAtivacao in (0,1))
);

CREATE TABLE leitura (
    idLeitura    INT       AUTO_INCREMENT,
    fkSensor     INT,
    fkEmpresa    INT,
    fkSetor   INT,
    umidadeSolo  FLOAT     NOT NULL,
    dtColeta     DATETIME  DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pkCompostaLeitura PRIMARY KEY (idLeitura, fkSensor, fkEmpresa, fkSetor),
    CONSTRAINT fkLeituraSetor FOREIGN KEY (fkSetor) REFERENCES sensor(fkSetor),
    CONSTRAINT fkLeituraSensor FOREIGN KEY (fkSensor) REFERENCES sensor(idSensor),
    CONSTRAINT fkLeituraEmpresa FOREIGN KEY (fkEmpresa) REFERENCES sensor(fkEmpresa)
) AUTO_INCREMENT = 100;

CREATE TABLE alerta (
    idAlerta    INT       AUTO_INCREMENT,
    fkSensor    INT,
    fkEmpresa   INT,
    fkSetor  INT,
    fkLeitura   INT,
    dtAlerta    DATETIME  DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pkCompostaAlerta PRIMARY KEY(idAlerta, fkLeitura, fkSensor, fkEmpresa, fkSetor),
    CONSTRAINT fkAlertaSetor FOREIGN KEY (fkSetor) REFERENCES sensor(fkSetor),
    CONSTRAINT fkAlertaSensor FOREIGN KEY (fkSensor) REFERENCES sensor(idSensor),
    CONSTRAINT fkAlertaEmpresa FOREIGN KEY (fkEmpresa) REFERENCES sensor(fkEmpresa),
    CONSTRAINT fkAlertaLeitura FOREIGN KEY (fkLeitura) REFERENCES leitura(idLeitura)
);

DROP USER IF EXISTS webdataviz;
CREATE USER 'webdataviz'@'%' IDENTIFIED BY 'Webdataviz#123.';
GRANT ALL PRIVILEGES ON QuimiControl.* TO 'webdataviz'@'%';
DROP USER IF EXISTS dataacquino;
CREATE USER 'dataacquino'@'%' IDENTIFIED BY 'dataacquino#123.';
GRANT INSERT ON QuimiControl.* TO 'dataacquino'@'%';

flush privileges;

DELIMITER $$
DROP TRIGGER IF EXISTS TG_after_data_insert_alert;
CREATE TRIGGER TG_after_data_insert_alert 
    AFTER INSERT ON leitura FOR EACH ROW 
	BEGIN 
		IF (NEW.umidadeSolo>20 OR NEW.umidadeSolo<15) THEN
			INSERT INTO alerta (fkSensor, fkEmpresa, fkSetor, fkLeitura) VALUES (NEW.fkSensor, NEW.fkEmpresa, NEW.fkSetor, NEW.idLeitura);
		END IF;
    END;$$
DELIMITER ;



