/**
 * The Kairos React layer.
 *
 * These components emit the classes in `kairos.css` and hold no styling
 * decisions of their own. If you find yourself passing a `style` prop with a
 * colour or a pixel value into one, the value belongs in the token layer.
 *
 * Peer dependencies: `react` everywhere, `radix-ui` for the components that
 * open something over the page, and `@tanstack/react-table` for `DataTable`.
 * Both are optional: a package importing `Button` installs neither.
 */

export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';

export { default as StateChip } from './StateChip';
export type { StateChipProps, StateVariant } from './StateChip';

export { default as Segmented } from './Segmented';
export type { SegmentedProps, SegmentedOption } from './Segmented';

export { default as InputField, Field, Textarea, SelectField } from './Field';
export { default as FilterBar } from './FilterBar';
export type { InputFieldProps, FieldProps, TextareaProps, SelectFieldProps } from './Field';
export type { FilterBarProps, FilterState, FilterSegment } from './FilterBar';

export { default as Select, FILTER_THRESHOLD } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { default as Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { default as Popover } from './Popover';
export type { PopoverProps } from './Popover';

export { default as Banner } from './Banner';
export type { BannerProps, BannerTone } from './Banner';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { default as SortHeader, SortAnnouncer } from './SortHeader';
export type { SortHeaderProps, SortDirection } from './SortHeader';

export { default as OverflowMenu } from './OverflowMenu';
export type { OverflowMenuProps, OverflowItem } from './OverflowMenu';

export { default as ActionSet } from './ActionSet';
export type {
  Action,
  ActionContext,
  ActionSetProps,
  Destructive,
  DestructiveAction,
  LinkAction,
  RankedAction,
  RunAction,
  SecondaryActions,
} from './ActionSet';

export { default as DataTable } from './DataTable';
export { compare, sortRows, nextSort } from './sort';
export type { SortState, Sortable } from './sort';
export type { DataTableProps, Column, ColumnRole, Selection } from './DataTable';

export { default as CollapsibleCard } from './CollapsibleCard';
export type { CollapsibleCardProps } from './CollapsibleCard';

export { default as Dialog } from './Dialog';
export type { DialogProps } from './Dialog';

export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps, ConfirmDetails } from './ConfirmDialog';
export { confirmationMatches, confirmGateOpen } from './confirm';
export type { ConfirmGate } from './confirm';

export { default as CopyField } from './CopyField';
export type { CopyFieldProps } from './CopyField';

export { default as Toast, ToastRegion, TransientToast } from './Toast';
export type { ToastProps } from './Toast';

export { default as Panel, PageHeader, Metric, MetricRow, Skeleton, SkeletonStack } from './Panel';
export type { PanelProps, PageHeaderProps, MetricProps } from './Panel';

export { default as BrandLockup } from './BrandLockup';
export type { BrandLockupProps } from './BrandLockup';

export { default as AuthScreen, AuthForm, AuthLink } from './AuthScreen';
export type { AuthScreenProps, AuthFormProps, AuthLinkProps } from './AuthScreen';

export {
  default as AppShell,
  Sidebar,
  NavGroup,
  NavLink,
  TopBar,
  BottomNav,
  BottomNavLink,
} from './AppShell';
export type {
  AppShellProps,
  SidebarProps,
  NavGroupProps,
  NavLinkProps,
  TopBarProps,
  BottomNavProps,
  BottomNavLinkProps,
} from './AppShell';

export { default as SectionTag } from './SectionTag';
export type { SectionTagProps } from './SectionTag';

export {
  default as ThemeToggle,
  ThemeSetting,
  useThemePreference,
  applyTheme,
  themeInitScript,
  setThemeStorageKey,
} from './theme';
export type { ThemePreference } from './theme';
