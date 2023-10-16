import { useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { OfferingCourseStaff } from '@polito/api-client/models';
import { Person } from '@polito/api-client/models/Person';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetPersons } from '../../../core/queries/peopleHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { StaffListItem } from '../components/StaffListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Staff'>;

export const StaffScreen = ({ route }: Props) => {
  const { staff } = route.params;

  const staffIds = useMemo(() => staff.map(s => s.id), [staff]);

  const { queries: staffQueries, isLoading } = useGetPersons(staffIds);

  const staffPeople: (Person & OfferingCourseStaff)[] = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const staffData: (Person & OfferingCourseStaff)[] = [];

    staffQueries.forEach((staffQuery, index) => {
      if (!staffQuery.data) return;
      staffData.push({
        ...staffQuery.data,
        ...staff[index],
      });
    });

    return staffData;
  }, [isLoading, staff, staffQueries]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Section>
          <OverviewList loading={isLoading}>
            {staffPeople.map(person => (
              <StaffListItem
                key={`${person.id}${person.courseId}`}
                staff={person}
              />
            ))}
          </OverviewList>
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};
