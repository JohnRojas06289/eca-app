export type OperationalUserType = 'residencial' | 'comercial' | 'oficial';
export type OperationalVehicleType = 'automotor' | 'traccion_humana' | 'vehiculo_asistido';
export type OperationalWeekday =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export type OperationalMaterialFamily =
  | 'Metales'
  | 'Papel y cartón'
  | 'Plásticos'
  | 'Vidrio'
  | 'Textil'
  | 'Madera'
  | 'Especiales';

export interface OperationalReportSettings {
  reportName: string;
  nuap: string;
  nueca: string;
  aforadoThresholdKg: number;
}

export interface OperationalMicroRouteConfig {
  macroRoute: string;
  microRoute: string;
  frequencyDays: OperationalWeekday[];
  onlyAssociatedToEca: boolean;
}

export interface OperationalMaterialCatalogItem {
  family: OperationalMaterialFamily;
  name: string;
  code: string;
}

export interface OperationalReportRecordInput {
  id: string;
  createdAt: string;
  macroRoute: string;
  microRoute: string;
  linkedUsersCount: number;
  userType: OperationalUserType;
  operatorName: string;
  operatorIdentification: string;
  vehicleType: OperationalVehicleType;
  vehiclePlate?: string;
  materialCode: string;
  quantityKg: number;
  effectiveKg: number;
  appliesDcto596: boolean;
  forceAforado?: boolean;
  associatedToEca?: boolean;
}

export interface OperationalReportRecord {
  id: string;
  createdAt: string;
  nuap: string;
  nueca: string;
  macroRoute: string;
  microRoute: string;
  linkedUsersCount: number;
  isAforado: boolean;
  userType: OperationalUserType;
  operatorCode: string;
  operatorName: string;
  operatorIdentification: string;
  vehicleType: OperationalVehicleType;
  vehiclePlate?: string;
  frequencyDays: OperationalWeekday[];
  materialFamily: OperationalMaterialFamily;
  materialCode: string;
  materialName: string;
  quantityKg: number;
  effectiveKg: number;
  rejectedKg: number;
  appliesDcto596: boolean;
  associatedToEca: boolean;
}

export const DEFAULT_OPERATIONAL_REPORT_SETTINGS: OperationalReportSettings = {
  reportName: 'Reporte operativo',
  nuap: 'NUAP-001',
  nueca: 'NUECA-001',
  aforadoThresholdKg: 50,
};

export const OPERATIONAL_USER_TYPES: Array<{
  label: string;
  value: OperationalUserType;
}> = [
  { label: 'Residencial', value: 'residencial' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Oficial', value: 'oficial' },
];

export const OPERATIONAL_VEHICLE_TYPES: Array<{
  label: string;
  value: OperationalVehicleType;
}> = [
  { label: 'Automotor', value: 'automotor' },
  { label: 'Tracción humana', value: 'traccion_humana' },
  { label: 'Vehículo asistido', value: 'vehiculo_asistido' },
];

export const OPERATIONAL_MICRO_ROUTES: OperationalMicroRouteConfig[] = [
  {
    macroRoute: '1',
    microRoute: '1.1',
    frequencyDays: ['Lunes', 'Miércoles', 'Viernes'],
    onlyAssociatedToEca: true,
  },
  {
    macroRoute: '1',
    microRoute: '1.2',
    frequencyDays: ['Martes', 'Jueves'],
    onlyAssociatedToEca: true,
  },
  {
    macroRoute: '2',
    microRoute: '2.1',
    frequencyDays: ['Lunes', 'Jueves'],
    onlyAssociatedToEca: true,
  },
  {
    macroRoute: '2',
    microRoute: '2.2',
    frequencyDays: ['Miércoles', 'Sábado'],
    onlyAssociatedToEca: true,
  },
  {
    macroRoute: '3',
    microRoute: '3.1',
    frequencyDays: ['Martes', 'Viernes'],
    onlyAssociatedToEca: true,
  },
];

export const OPERATIONAL_MATERIAL_CATALOG: OperationalMaterialCatalogItem[] = [
  { family: 'Metales', name: 'Aluminio', code: '101' },
  { family: 'Metales', name: 'Chatarra', code: '102' },
  { family: 'Metales', name: 'Cobre', code: '103' },
  { family: 'Metales', name: 'Bronce', code: '104' },
  { family: 'Metales', name: 'Antimonio', code: '105' },
  { family: 'Metales', name: 'Acero', code: '106' },
  { family: 'Metales', name: 'Otros metales', code: '199' },

  { family: 'Papel y cartón', name: 'Archivo', code: '201' },
  { family: 'Papel y cartón', name: 'Cartón', code: '202' },
  { family: 'Papel y cartón', name: 'Cubetas o paneles', code: '203' },
  { family: 'Papel y cartón', name: 'Periódico', code: '204' },
  { family: 'Papel y cartón', name: 'Plegadiza', code: '205' },
  { family: 'Papel y cartón', name: 'Tetra Pack', code: '206' },
  { family: 'Papel y cartón', name: 'Plastificado', code: '207' },
  { family: 'Papel y cartón', name: 'Kraft', code: '208' },
  { family: 'Papel y cartón', name: 'Otros papel y cartón', code: '299' },

  { family: 'Plásticos', name: 'Acrílico', code: '301' },
  { family: 'Plásticos', name: 'Pasta', code: '302' },
  { family: 'Plásticos', name: 'PET', code: '303' },
  { family: 'Plásticos', name: 'PVC', code: '304' },
  { family: 'Plásticos', name: 'Plástico blanco', code: '305' },
  { family: 'Plásticos', name: 'Polietileno', code: '306' },
  { family: 'Plásticos', name: 'Soplado', code: '307' },
  { family: 'Plásticos', name: 'Polipropileno', code: '308' },
  { family: 'Plásticos', name: 'Otros plásticos', code: '399' },

  { family: 'Vidrio', name: 'Otros vidrios', code: '499' },
  { family: 'Textil', name: 'Otros textiles', code: '599' },
  { family: 'Madera', name: 'Otros maderables', code: '699' },

  { family: 'Especiales', name: 'Residuos de aparatos eléctricos', code: '701' },
  { family: 'Especiales', name: 'Otros especiales', code: '799' },
];

export function getOperationalMaterialByCode(code: string) {
  return OPERATIONAL_MATERIAL_CATALOG.find((item) => item.code === code);
}

export function buildOperatorCode(name: string, identification: string) {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const digits = String(identification).replace(/\D/g, '');
  const lastThree = digits.slice(-3).padStart(3, '0');

  return `${initials || 'OP'}-${lastThree}`;
}

export function getMicroRouteConfig(microRoute: string) {
  return OPERATIONAL_MICRO_ROUTES.find((item) => item.microRoute === microRoute);
}

export function toOperationalReportRecordInput(
  record: OperationalReportRecord,
): OperationalReportRecordInput {
  return {
    id: record.id,
    createdAt: record.createdAt,
    macroRoute: record.macroRoute,
    microRoute: record.microRoute,
    linkedUsersCount: record.linkedUsersCount,
    userType: record.userType,
    operatorName: record.operatorName,
    operatorIdentification: record.operatorIdentification,
    vehicleType: record.vehicleType,
    vehiclePlate: record.vehiclePlate,
    materialCode: record.materialCode,
    quantityKg: record.quantityKg,
    effectiveKg: record.effectiveKg,
    appliesDcto596: record.appliesDcto596,
    forceAforado: record.isAforado,
    associatedToEca: record.associatedToEca,
  };
}

export function createOperationalReportRecord(
  input: OperationalReportRecordInput,
  settings: OperationalReportSettings = DEFAULT_OPERATIONAL_REPORT_SETTINGS,
): OperationalReportRecord {
  const material = getOperationalMaterialByCode(input.materialCode);
  const microRouteConfig = getMicroRouteConfig(input.microRoute);
  const effectiveKg = Number(input.effectiveKg ?? input.quantityKg);
  const quantityKg = Number(input.quantityKg ?? 0);
  const rejectedKg = Math.max(quantityKg - effectiveKg, 0);
  const associatedToEca = input.associatedToEca ?? true;

  return {
    id: input.id,
    createdAt: input.createdAt,
    nuap: settings.nuap,
    nueca: settings.nueca,
    macroRoute: input.macroRoute,
    microRoute: input.microRoute,
    linkedUsersCount: input.linkedUsersCount,
    isAforado: input.forceAforado ?? quantityKg >= settings.aforadoThresholdKg,
    userType: input.userType,
    operatorCode: buildOperatorCode(input.operatorName, input.operatorIdentification),
    operatorName: input.operatorName,
    operatorIdentification: input.operatorIdentification,
    vehicleType: input.vehicleType,
    vehiclePlate: input.vehiclePlate,
    frequencyDays:
      associatedToEca && microRouteConfig?.onlyAssociatedToEca
        ? microRouteConfig.frequencyDays
        : [],
    materialFamily: material?.family ?? 'Plásticos',
    materialCode: input.materialCode,
    materialName: material?.name ?? 'Material sin catálogo',
    quantityKg,
    effectiveKg,
    rejectedKg,
    appliesDcto596: input.appliesDcto596,
    associatedToEca,
  };
}

export const OPERATIONAL_REPORT_SAMPLE_ROWS: OperationalReportRecord[] = [
  createOperationalReportRecord({
    id: 'op-001',
    createdAt: '2026-04-29T08:15:00.000Z',
    macroRoute: '1',
    microRoute: '1.1',
    linkedUsersCount: 18,
    userType: 'residencial',
    operatorName: 'Juan Pérez',
    operatorIdentification: '123456789',
    vehicleType: 'automotor',
    vehiclePlate: 'ZPA-321',
    materialCode: '303',
    quantityKg: 72,
    effectiveKg: 68,
    appliesDcto596: true,
  }),
  createOperationalReportRecord({
    id: 'op-002',
    createdAt: '2026-04-29T10:40:00.000Z',
    macroRoute: '1',
    microRoute: '1.2',
    linkedUsersCount: 8,
    userType: 'comercial',
    operatorName: 'Rosa Cárdenas',
    operatorIdentification: '987654321',
    vehicleType: 'vehiculo_asistido',
    vehiclePlate: 'WXT-908',
    materialCode: '202',
    quantityKg: 41,
    effectiveKg: 39,
    appliesDcto596: false,
  }),
  createOperationalReportRecord({
    id: 'op-003',
    createdAt: '2026-04-28T14:05:00.000Z',
    macroRoute: '2',
    microRoute: '2.1',
    linkedUsersCount: 25,
    userType: 'oficial',
    operatorName: 'Carlos Romero',
    operatorIdentification: '456789123',
    vehicleType: 'traccion_humana',
    materialCode: '101',
    quantityKg: 58,
    effectiveKg: 55,
    appliesDcto596: true,
  }),
  createOperationalReportRecord({
    id: 'op-004',
    createdAt: '2026-04-27T09:20:00.000Z',
    macroRoute: '2',
    microRoute: '2.2',
    linkedUsersCount: 12,
    userType: 'residencial',
    operatorName: 'Nidia Gutiérrez',
    operatorIdentification: '321654987',
    vehicleType: 'automotor',
    vehiclePlate: 'ABC-456',
    materialCode: '206',
    quantityKg: 33,
    effectiveKg: 30,
    appliesDcto596: false,
  }),
  createOperationalReportRecord({
    id: 'op-005',
    createdAt: '2026-04-26T16:50:00.000Z',
    macroRoute: '3',
    microRoute: '3.1',
    linkedUsersCount: 21,
    userType: 'comercial',
    operatorName: 'Sofía Vargas',
    operatorIdentification: '654987321',
    vehicleType: 'vehiculo_asistido',
    vehiclePlate: 'JKL-220',
    materialCode: '307',
    quantityKg: 65,
    effectiveKg: 60,
    appliesDcto596: true,
  }),
];
