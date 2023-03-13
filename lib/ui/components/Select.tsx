import { useMemo } from 'react';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { MenuView } from '@react-native-menu/menu';

import { IS_ANDROID } from '../../../src/core/constants';

interface DropdownOption {
  id: string;
  title: string;
  image?: string;
  imageColor?: string;
  state?: 'off' | 'on' | 'mixed' | undefined;
}

interface Props {
  options: DropdownOption[];
  onSelectOption?: (id: string) => void;
  value?: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const Select = ({
  options,
  onSelectOption,
  value,
  label,
  description,
  disabled,
}: Props) => {
  const displayedValue = useMemo(() => {
    return options?.find(opt => opt?.id === value)?.title;
  }, [options, value]);

  return (
    <MenuView
      style={{ width: '100%' }}
      title={label}
      actions={options}
      onPressAction={({ nativeEvent: { event } }) => {
        !disabled && onSelectOption?.(event);
      }}
    >
      <ListItem
        isAction
        disabled={disabled}
        title={displayedValue || label}
        subtitle={description}
        trailingItem={IS_ANDROID ? <Icon icon={faChevronDown} /> : null}
      />
    </MenuView>
  );
};
