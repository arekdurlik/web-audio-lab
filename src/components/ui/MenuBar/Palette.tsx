import { ThemeColors } from '../../../98';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Hr } from '../../nodes/BaseNode/styled';
import { ColorPicker } from '../ColorPicker';
import { Tooltip } from '../Tooltip';
import { Menu, MenuItem, PaletteRow } from './styled';

const themeLabels: { key: keyof ThemeColors; label: string }[] = [
    { key: 'highlight', label: 'Highlight' },
    { key: 'face', label: 'Face' },
    { key: 'surface', label: 'Background' },
    { key: 'shadow', label: 'Shadow' },
    { key: 'frame', label: 'Frame' },
    { key: 'text', label: 'Text' },
];

export function Palette() {
    const theme = useSettingsStore(state => state.theme);
    const setThemeColor = useSettingsStore(state => state.setThemeColor);
    const resetTheme = useSettingsStore(state => state.resetTheme);

    return (
        <Menu>
            <PaletteRow>
                {themeLabels.map(({ key, label }) => (
                    <Tooltip key={key} content={label}>
                        <ColorPicker
                            value={theme[key]}
                            onChange={hex => setThemeColor(key, hex)}
                        />
                    </Tooltip>
                ))}
            </PaletteRow>
            <Hr />
            <MenuItem onClick={resetTheme}>Reset colors</MenuItem>
        </Menu>
    );
}
