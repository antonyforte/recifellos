import { Test, TestingModule } from '@nestjs/testing';
import { CalcadosController } from './calcados.controller';

describe('CalcadosController', () => {
  let controller: CalcadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalcadosController],
    }).compile();

    controller = module.get<CalcadosController>(CalcadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
