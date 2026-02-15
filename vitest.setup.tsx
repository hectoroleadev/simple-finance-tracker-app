
import { vi } from 'vitest';

// Mock problematic modules that cause ERR_REQUIRE_ESM in JSDOM
vi.mock('@asamuzakjp/css-color', () => ({}));
vi.mock('@csstools/css-calc', () => ({}));

// Mock UI libraries that might trigger CSS loading
vi.mock('lucide-react', () => ({
    Trash2: () => 'TrashIcon',
    Plus: () => 'PlusIcon',
    TrendingUp: () => 'TrendUpIcon',
    TrendingDown: () => 'TrendDownIcon',
    Wallet: () => 'WalletIcon',
    PieChart: () => 'PieChartIcon',
    History: () => 'HistoryIcon',
    Menu: () => 'MenuIcon',
    X: () => 'XIcon',
    ArrowUpRight: () => 'ArrowIcon',
    ArrowDownRight: () => 'ArrowIcon',
    Info: () => 'InfoIcon',
    Calendar: () => 'CalendarIcon',
    Settings: () => 'SettingsIcon',
    ChevronRight: () => 'ChevronIcon',
    LogOut: () => 'LogOutIcon',
}));

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => children,
    AreaChart: () => 'AreaChart',
    Area: () => 'Area',
    XAxis: () => 'XAxis',
    YAxis: () => 'YAxis',
    CartesianGrid: () => 'CartesianGrid',
    Tooltip: () => 'Tooltip',
    LineChart: () => 'LineChart',
    Line: () => 'Line',
}));

// Mock react-window to avoid virtualization complexities in JSDOM
vi.mock('react-window', () => ({
    FixedSizeList: ({ children, itemCount, itemData }: any) => {
        const items = [];
        for (let i = 0; i < itemCount; i++) {
            items.push(children({ index: i, data: itemData, style: {} }));
        }
        return <div>{ items } </div>;
    },
}));

// Provide crypto mock globally for JSDOM
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'crypto', {
        value: { randomUUID: () => 'uuid-test' },
        writable: true
    });
}
