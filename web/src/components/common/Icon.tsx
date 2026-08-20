import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Compass01Icon,
  Search01Icon,
  Location01Icon,
  StarIcon,
  FavouriteIcon,
  Clock01Icon,
  Image01Icon,
  MapsIcon,
  UserIcon,
  Settings02Icon,
  AiSecurityIcon,
  Notification01Icon,
  FilterIcon,
  Grid02Icon,
  SparklesIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Building01Icon,
  Route02Icon,
  CloudIcon,
  Shield01Icon,
  Loading03Icon,
  Sorting01Icon,
  Download04Icon,
  Upload04Icon,
  Delete02Icon,
  PencilEdit02Icon,
  LinkSquare02Icon,
  Menu01Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  RefreshIcon,
  Share01Icon,
  Bookmark01Icon,
  Home01Icon,
  Logout01Icon,
  LockPasswordIcon,
  Mail01Icon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  Alert01Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Moon02Icon,
  Sun01Icon,
  ComputerIcon,
  FileNotFoundIcon,
  WifiDisconnected01Icon,
  Wifi01Icon,
} from '@hugeicons/core-free-icons'

export type IconName =
  | 'home'
  | 'navigation'
  | 'search'
  | 'location'
  | 'ratings'
  | 'star'
  | 'favorite'
  | 'clock'
  | 'media'
  | 'image'
  | 'map'
  | 'user'
  | 'profile'
  | 'settings'
  | 'ai'
  | 'notification'
  | 'logout'
  | 'lock'
  | 'mail'
  | 'eye'
  | 'eye-off'
  | 'empty'
  | 'offline'
  | 'online'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'moon'
  | 'sun'
  | 'system'
  | 'arrow-right'
  | 'arrow-left'
  | 'filter'
  | 'sparkles'
  | 'grid'
  | 'categories'
  | 'places'
  | 'building'
  | 'route'
  | 'weather'
  | 'shield'
  | 'safety'
  | 'loading'
  | 'sort'
  | 'download'
  | 'upload'
  | 'delete'
  | 'edit'
  | 'external-link'
  | 'list'
  | 'check'
  | 'close'
  | 'refresh'
  | 'menu'
  | 'share'
  | 'bookmark'
  | 'gallery'
  | 'notifications'
  | 'admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<IconName, any> = {
  home: Home01Icon,
  navigation: Compass01Icon,
  search: Search01Icon,
  location: Location01Icon,
  ratings: StarIcon,
  star: StarIcon,
  favorite: FavouriteIcon,
  clock: Clock01Icon,
  media: Image01Icon,
  image: Image01Icon,
  gallery: Image01Icon,
  map: MapsIcon,
  user: UserIcon,
  profile: UserIcon,
  admin: Shield01Icon,
  settings: Settings02Icon,
  ai: AiSecurityIcon,
  notification: Notification01Icon,
  notifications: Notification01Icon,
  logout: Logout01Icon,
  lock: LockPasswordIcon,
  mail: Mail01Icon,
  eye: EyeIcon,
  'eye-off': EyeOffIcon,
  empty: FileNotFoundIcon,
  offline: WifiDisconnected01Icon,
  online: Wifi01Icon,
  error: AlertCircleIcon,
  warning: Alert01Icon,
  info: InformationCircleIcon,
  success: CheckmarkCircle02Icon,
  moon: Moon02Icon,
  sun: Sun01Icon,
  system: ComputerIcon,
  'arrow-right': ArrowRight01Icon,
  'arrow-left': ArrowLeft01Icon,
  filter: FilterIcon,
  sparkles: SparklesIcon,
  grid: Grid02Icon,
  categories: Grid02Icon,
  places: Building01Icon,
  building: Building01Icon,
  route: Route02Icon,
  weather: CloudIcon,
  shield: Shield01Icon,
  safety: Shield01Icon,
  loading: Loading03Icon,
  sort: Sorting01Icon,
  download: Download04Icon,
  upload: Upload04Icon,
  delete: Delete02Icon,
  edit: PencilEdit02Icon,
  'external-link': LinkSquare02Icon,
  list: Menu01Icon,
  check: CheckmarkBadge01Icon,
  close: Cancel01Icon,
  refresh: RefreshIcon,
  menu: Menu01Icon,
  share: Share01Icon,
  bookmark: Bookmark01Icon,
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number

const SIZE_MAP: Record<string, number> = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
}

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'size'> {
  name?: IconName
  icon?: IconName
  size?: IconSize
  strokeWidth?: number
  variant?: 'stroke' | 'solid' | string
  color?: string
  className?: string
  spinning?: boolean
  label?: string
  'aria-label'?: string
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      icon,
      size = 'md',
      strokeWidth = 1.5,
      color = 'currentColor',
      className = '',
      spinning = false,
      label,
      'aria-label': ariaLabelProp,
      ...props
    },
    ref
  ) => {
    const targetName = name || icon || 'navigation'
    const iconComponent = ICON_MAP[targetName] || Compass01Icon
    const numericSize = typeof size === 'number' ? size : SIZE_MAP[size] || 20
    const activeLabel = label || ariaLabelProp

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center shrink-0 ${
          spinning ? 'animate-spin' : ''
        } ${className}`}
        role={activeLabel ? 'img' : 'presentation'}
        aria-label={activeLabel}
        aria-hidden={!activeLabel}
        {...props}
      >
        <HugeiconsIcon
          icon={iconComponent}
          size={numericSize}
          strokeWidth={strokeWidth}
          color={color}
        />
      </span>
    )
  }
)

Icon.displayName = 'Icon'

export default Icon
