// Wrapper assíncrono para a tela Operação. Trocar por fetch quando o backend subir.
import {
  farmaciasMock, lideresMock, entregadoresMock, alertasMock, kpisMock,
  volumePorHora, slaPorFarmacia, faltasVsDiarias,
} from "@/data/operacaoMock";

const wait = <T,>(value: T, ms = 100): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

export const operacaoApi = {
  listKpis: () => wait(kpisMock),
  listFarmacias: () => wait(farmaciasMock),
  listLideres: () => wait(lideresMock),
  listEntregadores: () => wait(entregadoresMock),
  listAlertas: () => wait(alertasMock),
  charts: () => wait({ volumePorHora, slaPorFarmacia, faltasVsDiarias }),
};
