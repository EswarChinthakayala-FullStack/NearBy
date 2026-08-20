import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { useToggleFavorite } from '@/hooks/useFavorites'
import { buttonPressVariants } from '@/lib/motion-variants'

export interface FavoriteButtonProps {
  placeUuid: string
  isFavorited?: boolean
  className?: string
  size?: 'xs' | 'sm' | 'md'
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  placeUuid,
  isFavorited = false,
  className = '',
  size = 'xs',
}) => {
  const [internalFavorited, setInternalFavorited] = React.useState(isFavorited)

  React.useEffect(() => {
    setInternalFavorited(isFavorited)
  }, [isFavorited])

  const toggleFavoriteMutation = useToggleFavorite()
  const isLoading = toggleFavoriteMutation.isPending

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return

    const nextState = !internalFavorited
    setInternalFavorited(nextState)

    toggleFavoriteMutation.mutate(placeUuid, {
      onSuccess: (res: any) => {
        const serverState = res?.data?.is_favorited ?? res?.is_favorited ?? res?.data?.is_favorite ?? nextState
        setInternalFavorited(serverState)
      },
      onError: () => {
        setInternalFavorited(!nextState)
      },
    })
  }

  return (
    <motion.button
      type="button"
      variants={buttonPressVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center justify-center rounded-sm p-2 border backdrop-blur-md transition-all shadow-md ${
        internalFavorited
          ? 'bg-slate-950/90 border-rose-500/60 text-rose-500 shadow-rose-500/10'
          : 'bg-slate-950/80 border-white/20 text-white/80 hover:text-rose-400 hover:border-rose-500/60 hover:bg-slate-950/95'
      } ${className}`}
      title={internalFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label="Toggle Favorite"
    >
      {isLoading ? (
        <Icon name="loading" size={size} spinning className="text-rose-500" />
      ) : (
        <Icon
          name="favorite"
          size={size}
          className={internalFavorited ? 'fill-rose-500 text-rose-500' : ''}
        />
      )}
    </motion.button>
  )
}

export default FavoriteButton
