/**
 * The Kairos React layer.
 *
 * These components emit the classes in `kairos.css` and hold no styling
 * decisions of their own. If you find yourself passing a `style` prop with a
 * colour or a pixel value into one, the value belongs in the token layer.
 *
 * Peer dependencies: `react` everywhere, and `@radix-ui/react-dialog` for
 * `Dialog` and `ConfirmDialog` only.
 */

export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';

export { default as StateChip } from './StateChip';
export type { StateChipProps, StateVariant } from './StateChip';

export { default as Segmented } from './Segmented';
export type { SegmentedProps, SegmentedOption } from './Segmented';

export { default as InputField, Field } from './Field';
export type { InputFieldProps, FieldProps } from './Field';

export { default as Banner } from './Banner';
export type { BannerProps, BannerTone } from './Banner';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { default as SortHeader, SortAnnouncer } from './SortHeader';
export type { SortHeaderProps, SortDirection } from './SortHeader';

export { default as Dialog } from './Dialog';
export type { DialogProps } from './Dialog';

export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { default as Toast, ToastRegion, TransientToast } from './Toast';
export type { ToastProps } from './Toast';

export { default as Panel, PageHeader, Metric, MetricRow, Skeleton, SkeletonStack } from './Panel';
export type { PanelProps, PageHeaderProps, MetricProps } from './Panel';

export {
  default as ThemeToggle,
  ThemeSetting,
  useThemePreference,
  applyTheme,
  themeInitScript,
  setThemeStorageKey,
} from './theme';
export type { ThemePreference } from './theme';
