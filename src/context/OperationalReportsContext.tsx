import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  DEFAULT_OPERATIONAL_REPORT_SETTINGS,
  OPERATIONAL_MICRO_ROUTES,
  OPERATIONAL_REPORT_SAMPLE_ROWS,
  createOperationalReportRecord,
  toOperationalReportRecordInput,
  type OperationalMicroRouteConfig,
  type OperationalReportRecord,
  type OperationalReportRecordInput,
  type OperationalReportSettings,
} from '@/src/constants/operationalReport';

interface AddOperationalRecordInput
  extends Omit<OperationalReportRecordInput, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: string;
}

interface OperationalReportsContextValue {
  settings: OperationalReportSettings;
  setSettings: Dispatch<SetStateAction<OperationalReportSettings>>;
  recordInputs: OperationalReportRecordInput[];
  setRecordInputs: Dispatch<SetStateAction<OperationalReportRecordInput[]>>;
  records: OperationalReportRecord[];
  addRecord: (input: AddOperationalRecordInput) => OperationalReportRecordInput;
  routeConfigs: OperationalMicroRouteConfig[];
  setRouteConfigs: Dispatch<SetStateAction<OperationalMicroRouteConfig[]>>;
}

const OperationalReportsContext = createContext<OperationalReportsContextValue | null>(null);

export function OperationalReportsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<OperationalReportSettings>({
    ...DEFAULT_OPERATIONAL_REPORT_SETTINGS,
  });
  const [recordInputs, setRecordInputs] = useState<OperationalReportRecordInput[]>(() =>
    OPERATIONAL_REPORT_SAMPLE_ROWS.map(toOperationalReportRecordInput),
  );
  const [routeConfigs, setRouteConfigs] = useState<OperationalMicroRouteConfig[]>(
    OPERATIONAL_MICRO_ROUTES,
  );

  const records = useMemo(
    () => recordInputs.map((input) => createOperationalReportRecord(input, settings)),
    [recordInputs, settings],
  );

  const addRecord = useCallback((input: AddOperationalRecordInput) => {
    const nextRecord: OperationalReportRecordInput = {
      id: input.id ?? `op-${Date.now()}`,
      createdAt: input.createdAt ?? new Date().toISOString(),
      ...input,
    };
    setRecordInputs((prev) => [nextRecord, ...prev]);
    return nextRecord;
  }, []);

  return (
    <OperationalReportsContext.Provider
      value={{
        settings,
        setSettings,
        recordInputs,
        setRecordInputs,
        records,
        addRecord,
        routeConfigs,
        setRouteConfigs,
      }}
    >
      {children}
    </OperationalReportsContext.Provider>
  );
}

export function useOperationalReports(): OperationalReportsContextValue {
  const ctx = useContext(OperationalReportsContext);
  if (!ctx) {
    throw new Error(
      'useOperationalReports must be used inside OperationalReportsProvider',
    );
  }
  return ctx;
}
