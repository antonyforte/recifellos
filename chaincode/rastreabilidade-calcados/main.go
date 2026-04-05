package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract define a lógica de negócio central para o rastreamento da cadeia de suprimentos
// de calçados dentro da rede Hyperledger Fabric.
type SmartContract struct {
	contractapi.Contract
}

// Calcado representa o esquema do ativo (asset) armazenado no World State.
// Rastreia especificações técnicas, custódia atual e o status do ciclo de vida.
type Calcado struct {
	ID         string `json:"id"`         
	Marca      string `json:"marca"`      
	Modelo     string `json:"modelo"`     
	Tamanho    int    `json:"tamanho"`    
	DonoAtual  string `json:"donoAtual"`  // MSPID da organização que detém a custódia atual
	Status     string `json:"status"`     // Enum: PRODUZIDO, EM_TRANSITO, ENTREGUE_LOJA
}

// FabricarLote inicializa um novo ativo no Ledger.
// Acesso Restrito: Apenas a Org1 (Fábrica) está autorizada a emitir novos ativos.
func (s *SmartContract) FabricarLote(ctx contractapi.TransactionContextInterface, id string, marca string, modelo string, tamanho int) error {
	
	// Verificação de identidade via ClientIdentity (CID)
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("falha ao recuperar identidade do cliente: %v", err)
	}

	// ACL: Garante exclusividade da Org1 para criação de ativos
	if clientMSPID != "Org1MSP" {
		return fmt.Errorf("acesso negado: apenas Org1MSP (Fábrica) possui autorização para criação de ativos. ID atual: %s", clientMSPID)
	}

	// Verificação de colisão: Garante a idempotência do ativo
	exists, err := s.LoteExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("conflito de ativo: um lote com o ID %s já existe no World State", id)
	}

	// Normalização e inicialização de dados
	calcado := Calcado{
		ID:        id,
		Marca:     marca,
		Modelo:    modelo,
		Tamanho:   tamanho,
		DonoAtual: clientMSPID, // A custódia inicial pertence ao criador (Org1)
		Status:    "PRODUZIDO",
	}

	// Serialização para armazenamento no Ledger
	calcadoJSON, err := json.Marshal(calcado)
	if err != nil {
		return err
	}

	// Persistência do estado no World State
	return ctx.GetStub().PutState(id, calcadoJSON)
}

// ConsultarLote recupera o estado atual de um ativo através de sua chave composta (ID).
func (s *SmartContract) ConsultarLote(ctx contractapi.TransactionContextInterface, id string) (*Calcado, error) {
	// Recupera o byte slice do World State
	calcadoJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("falha ao ler do World State: %v", err)
	}
	if calcadoJSON == nil {
		return nil, fmt.Errorf("recurso não encontrado: o lote %s não existe", id)
	}

	// Desserialização do JSON para o modelo de domínio
	var calcado Calcado
	err = json.Unmarshal(calcadoJSON, &calcado)
	if err != nil {
		return nil, err
	}

	return &calcado, nil
}

// LoteExists é um método auxiliar para validar a existência de um ativo no World State.
func (s *SmartContract) LoteExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	calcadoJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("erro de leitura no ledger: %v", err)
	}
	return calcadoJSON != nil, nil
}

// TransferirParaDistribuidor inicia a transferência de custódia da Org1 (Fábrica) para a Org2 (Logística).
// Pré-requisito: A identidade chamadora deve ser o detentor atual da custódia.
func (s *SmartContract) TransferirParaDistribuidor(ctx contractapi.TransactionContextInterface, id string) error {
	// Verificação de identidade
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("erro de autenticação: falha ao resolver MSPID: %v", err)
	}

	// Busca o estado atual
	calcado, err := s.ConsultarLote(ctx, id)
	if err != nil {
		return err
	}

	// Lógica de Negócio: Valida autoridade de custódia
	if calcado.DonoAtual != clientMSPID {
		return fmt.Errorf("erro de autorização: a organização %s não detém a custódia do lote %s", clientMSPID, id)
	}

	// Atualização de estado para transferência de custódia
	calcado.DonoAtual = "Org2MSP"       // Atribuição para Logística
	calcado.Status = "EM_TRANSITO"      // Atualização do ciclo de vida logístico

	// Persistência das alterações
	calcadoJSON, err := json.Marshal(calcado)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, calcadoJSON)
}

// ReceberNaLoja finaliza a transferência de custódia da Org2 (Logística) para a Org3 (Varejo).
// Conclui a fase de distribuição do ciclo de vida do ativo.
func (s *SmartContract) ReceberNaLoja(ctx contractapi.TransactionContextInterface, id string) error {
	// Verificação de identidade
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("erro de autenticação: falha ao resolver MSPID: %v", err)
	}

	// Busca o estado atual
	calcado, err := s.ConsultarLote(ctx, id)
	if err != nil {
		return err
	}

	// Verificação de custódia
	if calcado.DonoAtual != clientMSPID {
		return fmt.Errorf("erro de autorização: a organização %s não possui direitos de custódia. Dono atual: %s", clientMSPID, calcado.DonoAtual)
	}

	// Atualização para o estado final de varejo
	calcado.DonoAtual = "Org3MSP"       // Entrega de titularidade ao Varejista
	calcado.Status = "ENTREGUE_LOJA"    // Pronto para consumo

	// Persistência da atualização
	calcadoJSON, err := json.Marshal(calcado)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, calcadoJSON)
}

// Ponto de entrada da execução: Instancia e inicia o processo do Chaincode.
func main() {
	calcadoChaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Falha na inicialização: não foi possível criar a instância do chaincode: %v", err)
	}

	if err := calcadoChaincode.Start(); err != nil {
		log.Panicf("Falha em tempo de execução: não foi possível iniciar o processo do chaincode: %v", err)
	}
}