import { useMemo } from 'react';

import { GetPlacesRequest, PlacesApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { noop } from 'lodash';

export const SITES_QUERY_KEY = 'sites';
export const BUILDINGS_QUERY_KEY = 'buildings';
export const PLACES_QUERY_KEY = 'places';
export const PLACE_QUERY_KEY = 'place';
export const PLACE_CATEGORIES_QUERY_KEY = 'place-categories';
export const FREE_ROOMS_QUERY_KEY = 'free-rooms';

const usePlacesClient = (): PlacesApi => {
  return new PlacesApi();
};

export const useGetSites = () => {
  const placesClient = usePlacesClient();

  return useQuery([SITES_QUERY_KEY], () => placesClient.getSites(), {
    staleTime: Infinity,
  });
};

export const useGetBuildings = (siteId?: string) => {
  const placesClient = usePlacesClient();

  return useQuery(
    [BUILDINGS_QUERY_KEY],
    () => placesClient.getBuildings({ siteId: siteId! }),
    {
      staleTime: Infinity,
      enabled: siteId != null,
    },
  );
};

export const useGetBuilding = (buildingId?: string) => {
  const { data: buildings, ...rest } = useGetBuildings();
  return useMemo(
    () => ({
      ...rest,
      data:
        buildingId == null || !buildings?.data?.length
          ? null
          : buildings.data.find(s => s.id === buildingId),
    }),
    [buildingId, buildings?.data, rest],
  );
};

export const useGetSite = (siteId?: string) => {
  const { data: sites } = useGetSites();
  return useMemo(() => {
    if (siteId == null || !sites?.data?.length) {
      return null;
    }
    return sites.data.find(s => s.id === siteId);
  }, [siteId, sites?.data]);
};

export const useGetPlaces = (params: GetPlacesRequest) => {
  const placesClient = usePlacesClient();
  const key = [PLACES_QUERY_KEY];
  if (params.siteId != null) {
    key.push(params.siteId);
  }
  if (params.search != null) {
    key.push(params.search);
  }
  if (params.floorId != null) {
    key.push(params.floorId);
  }
  if (params.buildingId != null) {
    key.push(params.buildingId);
  }
  if (params.placeCategoryId != null) {
    key.push(params.placeCategoryId);
  }
  if (params.placeSubCategoryId != null) {
    key.push(params.placeSubCategoryId.join());
  }

  return useQuery(key, () => placesClient.getPlaces(params), {
    enabled: params.siteId != null,
  });
};

export const useGetPlaceCategories = () => {
  const placesClient = usePlacesClient();

  return useQuery(
    [PLACE_CATEGORIES_QUERY_KEY],
    () => placesClient.getPlaceCategories(),
    {
      staleTime: Infinity,
    },
  );
};

export const useGetPlaceCategory = (categoryId?: string) => {
  const { data: categories } = useGetPlaceCategories();
  return useMemo(() => {
    if (categoryId == null || !categories?.data?.length) {
      return null;
    }
    return categories.data.find(c => c.id === categoryId);
  }, [categoryId, categories?.data]);
};

export const useGetPlaceSubCategory = (subCategoryId?: string) => {
  const { data: categories } = useGetPlaceCategories();
  return useMemo(() => {
    if (subCategoryId == null || !categories?.data?.length) {
      return null;
    }
    return categories.data
      .flatMap(c => c.subCategories ?? [])
      .find(sc => sc.id === subCategoryId);
  }, [subCategoryId, categories?.data]);
};

export const useGetPlace = (placeId?: string) => {
  const placesClient = usePlacesClient();

  return useQuery(
    [PLACE_QUERY_KEY, placeId],
    () => placesClient.getPlace({ placeId: placeId! }),
    {
      enabled: placeId != null,
      staleTime: Infinity,
      onError: noop,
    },
  );
};
