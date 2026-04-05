import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FabricService } from './fabric/fabric.service';
import { CalcadosController } from './calcados/calcados.controller';

@Module({
  imports: [],
  controllers: [AppController, CalcadosController],
  providers: [AppService, FabricService],
})
export class AppModule {}
