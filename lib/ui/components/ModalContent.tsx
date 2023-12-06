import { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

type Props = {
  title: string;
  close: () => void;
};

export const ModalContent = ({
  children,
  close,
  title,
}: PropsWithChildren<Props>) => {
  const styles = useStylesheet(createStyles);

  return (
    <View style={styles.container}>
      <HeaderAccessory
        justify="space-between"
        align="center"
        style={styles.header}
      >
        <View style={styles.headerLeft} />
        <Text style={styles.modalTitle}>{title}</Text>
        <IconButton icon={faTimes} onPress={close} adjustSpacing="left" />
      </HeaderAccessory>
      <View>{children}</View>
    </View>
  );
};

const createStyles = ({
  colors,
  spacing,
  shapes,
  fontSizes,
  fontWeights,
}: Theme) => ({
  container: {
    backgroundColor: colors.surface,
    borderTopRightRadius: shapes.md,
    borderTopLeftRadius: shapes.md,
  },
  header: {
    borderTopRightRadius: shapes.md,
    borderTopLeftRadius: shapes.md,
    paddingVertical: spacing[1],
  },
  headerLeft: { padding: spacing[3] },
  modalTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.prose,
  },
});
