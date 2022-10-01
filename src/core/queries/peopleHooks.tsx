import { useMemo } from 'react';

import { PeopleApi } from '@polito-it/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const PEOPLE_QUERY_KEY = 'people';
export const PERSON_QUERY_KEY = 'person';

const usePeopleClient = (): PeopleApi => {
  const {
    clients: { people: peopleClient },
  } = useApiContext();
  return peopleClient;
};

export const useGetPeople = (search: string) => {
  const peopleClient = usePeopleClient();

  return useQuery([PEOPLE_QUERY_KEY, search], () =>
    peopleClient.getPeople({ search }),
  );
};

export const useGetPerson = (personId: string) => {
  const peopleClient = usePeopleClient();

  return useQuery([PERSON_QUERY_KEY, personId], () =>
    peopleClient.getPerson({ personId }),
  );
};

export const useGetPersons = (personIds: string[]) => {
  const peopleClient = usePeopleClient();

  const queries = useQueries({
    queries: (personIds ?? []).map(personId => ({
      queryKey: [PERSON_QUERY_KEY, personId],
      queryFn: () => peopleClient.getPerson({ personId }),
    })),
  });

  const isLoading = useMemo(() => {
    if (!personIds) return true;
    return !queries.every(q => q.isLoading === false);
  }, [queries]);

  return { isLoading, queries };
};
