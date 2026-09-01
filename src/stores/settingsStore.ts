import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
    buildHoverAssets,
    buildRangeAssets,
    buildScrollbarAssets,
    hoverVarNames,
    rangeVarNames,
    scrollbarVarNames,
    themeDefaults,
    themeVarNames,
    ThemeColors,
} from '../98';

type EdgeType = 'default' | 'smoothstep';
type UIScale = 1 | 2;

type SettingsStore = {
    edgeType: EdgeType;
    getEdgeType: () => EdgeType;
    uiScale: UIScale;
    setEdgeType: (edgeType: EdgeType) => void;
    setUIScale: (uiScale: UIScale) => void;
    theme: ThemeColors;
    setThemeColor: (key: keyof ThemeColors, value: string) => void;
    resetTheme: () => void;
};

function applyTheme(theme: ThemeColors) {
    (Object.keys(theme) as (keyof ThemeColors)[]).forEach(key => {
        document.documentElement.style.setProperty(themeVarNames[key], theme[key]);
    });

    const assets = buildScrollbarAssets(theme);
    (Object.keys(assets) as (keyof typeof assets)[]).forEach(key => {
        document.documentElement.style.setProperty(scrollbarVarNames[key], assets[key]);
    });

    const rangeAssets = buildRangeAssets(theme);
    (Object.keys(rangeAssets) as (keyof typeof rangeAssets)[]).forEach(key => {
        document.documentElement.style.setProperty(rangeVarNames[key], rangeAssets[key]);
    });

    const hoverAssets = buildHoverAssets(theme);
    (Object.keys(hoverAssets) as (keyof typeof hoverAssets)[]).forEach(key => {
        document.documentElement.style.setProperty(hoverVarNames[key], hoverAssets[key]);
    });
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            edgeType: 'smoothstep',
            getEdgeType: () => get().edgeType,
            uiScale: 2,
            setEdgeType: (edgeType: EdgeType) => set({ edgeType }),
            setUIScale: (uiScale: UIScale) => set({ uiScale }),
            theme: themeDefaults,
            setThemeColor: (key, value) =>
                set(state => {
                    const theme = { ...state.theme, [key]: value };
                    applyTheme(theme);
                    return { theme };
                }),
            resetTheme: () =>
                set(() => {
                    applyTheme(themeDefaults);
                    return { theme: themeDefaults };
                }),
        }),
        {
            name: 'settings', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            onRehydrateStorage: () => state => {
                if (state) applyTheme(state.theme);
            },
        }
    )
);
