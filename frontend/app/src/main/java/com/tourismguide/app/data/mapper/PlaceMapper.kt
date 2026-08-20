package com.tourismguide.app.data.mapper

import com.tourismguide.app.data.local.entity.FavoritePlaceEntity
import com.tourismguide.app.data.local.entity.PlaceCacheEntity
import com.tourismguide.app.data.local.entity.ReviewEntity
import com.tourismguide.app.data.local.entity.UserEntity
import com.tourismguide.app.data.remote.dto.FavoriteDto
import com.tourismguide.app.data.remote.dto.PlaceDto
import com.tourismguide.app.data.remote.dto.PlaceListItemDto
import com.tourismguide.app.data.remote.dto.ReviewDto
import com.tourismguide.app.data.remote.dto.UserDto
import com.tourismguide.app.domain.model.Favorite
import com.tourismguide.app.domain.model.Place
import com.tourismguide.app.domain.model.PlaceListItem
import com.tourismguide.app.domain.model.Review
import com.tourismguide.app.domain.model.User

object PlaceMapper {
    fun PlaceDto.toDomain(): Place = Place(
        id = id,
        name = name,
        description = description,
        category = category,
        latitude = latitude,
        longitude = longitude,
        address = address,
        rating = rating,
        reviewCount = reviewCount,
        imageUrls = imageUrls,
        openStatus = openStatus,
        distanceKm = distanceKm,
        isFavorite = isFavorite
    )

    fun PlaceListItemDto.toDomain(): PlaceListItem = PlaceListItem(
        id = id,
        name = name,
        category = category,
        distanceFormatted = distanceFormatted,
        ratingFormatted = ratingFormatted,
        imageUrl = imageUrl,
        openStatus = openStatus,
        isFavorite = isFavorite
    )

    fun PlaceCacheEntity.toDomain(): PlaceListItem = PlaceListItem(
        id = id,
        name = name,
        category = category,
        distanceFormatted = "${String.format("%.1f", distanceKm)} km",
        ratingFormatted = String.format("%.1f", rating),
        imageUrl = "",
        openStatus = openStatus,
        isFavorite = isFavorite
    )
}

object UserMapper {
    fun UserDto.toDomain(): User = User(
        id = resolvedUuid,
        fullName = fullName,
        email = email,
        phone = resolvedPhone,
        avatarUrl = resolvedAvatarUrl
    )

    fun UserEntity.toDomain(): User = User(
        id = id,
        fullName = fullName,
        email = email,
        phone = phone
    )
}

object ReviewMapper {
    fun ReviewDto.toDomain(): Review = Review(
        id = id,
        placeId = placeId,
        userName = userName,
        userAvatarUrl = userAvatarUrl,
        rating = rating.toDouble(),
        comment = comment,
        createdAt = createdAt
    )

    fun ReviewEntity.toDomain(): Review = Review(
        id = id,
        placeId = placeId,
        userName = userName,
        userAvatarUrl = null,
        rating = rating,
        comment = comment,
        createdAt = createdAt
    )
}

object FavoriteMapper {
    fun FavoriteDto.toDomain(): Favorite = Favorite(
        id = id,
        placeId = placeId,
        placeName = placeName,
        placeCategory = placeCategory,
        imageUrl = imageUrl
    )

    fun FavoritePlaceEntity.toDomain(): Favorite = Favorite(
        id = placeId,
        placeId = placeId,
        placeName = name,
        placeCategory = category,
        imageUrl = imageUrl
    )
}
