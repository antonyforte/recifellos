import { Controller, Get, Post, Put, Param, Body, Headers, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Controller('api/calcados')
export class CalcadosController {
    constructor(private readonly fabricService: FabricService) { }

    @Get(':id')
    async consultarLote(@Param('id') id: string, @Headers('x-org-id') orgHeader: string) {
        const org = orgHeader || 'org1';
        const { gateway, contract } = await this.fabricService.getNetwork(org);

        try {
            const resultBytes = await contract.evaluateTransaction('ConsultarLote', id);
            const resultJson = new TextDecoder().decode(resultBytes);
            return JSON.parse(resultJson);
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        } finally {
            gateway.close();
        }
    }

    @Post()
    async fabricarLote(
        @Headers('x-org-id') org: string,
        @Body() body: { id: string; marca: string; modelo: string; tamanho: number },
    ) {
        if (!org) throw new BadRequestException('Header x-org-id é obrigatório');

        const { gateway, contract } = await this.fabricService.getNetwork(org);

        try {
            await contract.submitTransaction('FabricarLote', String(body.id), String(body.marca), String(body.modelo), String(body.tamanho));
            return { sucesso: true, mensagem: `Lote ${body.id} fabricado com sucesso!` };
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        } finally {
            gateway.close();
        }
    }

    @Put(':id/transferir')
    async transferirLote(
        @Param('id') id: string,
        @Headers('x-org-id') org: string,
        @Body('passo') passo: string,
    ) {
        if (!org) throw new BadRequestException('Header x-org-id é obrigatório');

        const { gateway, contract } = await this.fabricService.getNetwork(org);

        try {
            if (passo === 'logistica') {
                await contract.submitTransaction('TransferirParaDistribuidor', id);
            } else if (passo === 'varejo') {
                await contract.submitTransaction('ReceberNaLoja', id);
            } else {
                throw new BadRequestException("Passo inválido. Use 'logistica' ou 'varejo'");
            }
            return { sucesso: true, mensagem: `Lote ${id} transferido com sucesso!` };
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        } finally {
            gateway.close();
        }
    }
}