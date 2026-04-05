import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import { connect, signers, Contract, Gateway } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

const channelName = 'canal-calcados';
const chaincodeName = 'calcados';

const ORG_CONFIG = {
    org1: { mspId: 'Org1MSP', peerEndpoint: 'localhost:7051', peerHostAlias: 'peer0.org1.example.com' },
    org2: { mspId: 'Org2MSP', peerEndpoint: 'localhost:9051', peerHostAlias: 'peer0.org2.example.com' },
    org3: { mspId: 'Org3MSP', peerEndpoint: 'localhost:11051', peerHostAlias: 'peer0.org3.example.com' },
};

export interface NetworkSetup {
    gateway: Gateway;
    contract: Contract;
}

@Injectable()
export class FabricService {
    private async getFirstFile(dirPath: string): Promise<Buffer> {
        const ObjectPath = path.resolve(process.cwd(), dirPath);
        const files = await fs.readdir(ObjectPath);
        const targetFile = files.find(file => !file.startsWith('.'));
        if (!targetFile) throw new Error(`Nenhum arquivo encontrado em ${ObjectPath}`);
        return await fs.readFile(path.join(ObjectPath, targetFile));
    }

    private async createGrpcClient(org: string): Promise<grpc.Client> {
        const config = ORG_CONFIG[org as keyof typeof ORG_CONFIG];
        const tlsCertPath = path.resolve(process.cwd(), `crypto-config/${org}-tls.crt`);
        const tlsRootCert = await fs.readFile(tlsCertPath);

        const credentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(config.peerEndpoint, credentials, {
            'grpc.ssl_target_name_override': config.peerHostAlias,
        });
    }

    async getNetwork(org: string): Promise<NetworkSetup> {
        try {
            const config = ORG_CONFIG[org as keyof typeof ORG_CONFIG];
            if (!config) throw new Error(`Organização ${org} não configurada.`);

            const certBytes = await this.getFirstFile(`crypto-config/${org}-cert`);
            const keyBytes = await this.getFirstFile(`crypto-config/${org}-key`);

            const identity = { mspId: config.mspId, credentials: certBytes };
            const privateKey = crypto.createPrivateKey(keyBytes);
            const signer = signers.newPrivateKeySigner(privateKey);

            const client = await this.createGrpcClient(org);

            const gateway = connect({ client, identity, signer });
            const network = gateway.getNetwork(channelName);
            const contract = network.getContract(chaincodeName);

            return { gateway, contract };
        } catch (error: any) {
            throw new InternalServerErrorException(`Erro ao conectar na Blockchain: ${error.message}`);
        }
    }
}