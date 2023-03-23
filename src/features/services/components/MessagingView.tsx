import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View, ViewProps } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { openCamera } from 'react-native-image-crop-picker';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView } from '@react-native-menu/menu';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { pdfSizes } from '../../teaching/constants';
import { Attachment } from '../types/Attachment';
import { AttachmentChip } from './AttachmentChip';

interface Props extends ViewProps {
  message?: string;
  onMessageChange?: (message: string) => void;
  onSend?: () => void;
  attachment?: Attachment;
  onAttachmentChange?: (attachment?: Attachment) => void;
  loading?: boolean;
  disabled?: boolean;
  showSendButton?: boolean;
  translucent?: boolean;
  numberOfLines?: number;
  textFieldStyle?: ViewProps['style'];
}

export const MessagingView = ({
  message,
  onMessageChange,
  onSend,
  attachment,
  onAttachmentChange,
  loading = false,
  disabled = false,
  showSendButton = true,
  translucent = true,
  numberOfLines = 1,
  textFieldStyle,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const pickFile = async () => {
    onAttachmentChange?.(await DocumentPicker.pickSingle({}));
  };

  const takePicture = async () => {
    try {
      const picture = await openCamera({
        ...pdfSizes,
        mediaType: 'photo',
        multiple: false,
        cropping: true,
        freeStyleCropEnabled: true,
        includeBase64: true,
      });
      onAttachmentChange?.({
        uri: picture.path,
        name: picture.filename || t('common.unnamedFile'),
        size: picture.size,
        type: picture.mime,
      });
    } catch (e) {
      console.debug({ errorTakePhoto: e });
    }
  };

  return (
    <View
      {...props}
      style={[styles.wrapper, translucent && styles.translucent, props.style]}
    >
      {translucent && <TranslucentView fallbackOpacity={1} />}
      <Col>
        {!!attachment && (
          <FlatList
            data={[attachment]}
            contentContainerStyle={styles.attachmentContainer}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              return (
                <AttachmentChip
                  attachment={item}
                  onClearAttachment={() => onAttachmentChange(null)}
                />
              );
            }}
          />
        )}
        <Row align="flex-end">
          <MenuView
            actions={[
              {
                id: 'pickFile',
                title: t('messagingView.pickFile'),
                subtitle: t('messagingView.pickFileHint'),
                image: 'folder',
              },
              {
                id: 'takePicture',
                title: t('messagingView.takePhoto'),
                subtitle: t('messagingView.takePhotoHint'),
                image: 'camera',
              },
            ]}
            onPressAction={event => {
              if (event.nativeEvent.event === 'pickFile') {
                pickFile();
              } else {
                takePicture();
              }
            }}
          >
            <IconButton
              icon={faPaperclip}
              size={22}
              style={styles.actionButton}
              disabled={disabled}
            />
          </MenuView>
          <TranslucentTextField
            label={t('ticketScreen.reply')}
            value={message}
            autoCapitalize="sentences"
            onChangeText={onMessageChange}
            multiline
            editable={!disabled}
            style={[GlobalStyles.grow, textFieldStyle]}
            numberOfLines={numberOfLines}
          />
          {showSendButton && (
            <IconButton
              disabled={!message?.length}
              onPress={onSend}
              icon={faPaperPlane}
              size={22}
              loading={loading}
              style={styles.actionButton}
            />
          )}
        </Row>
      </Col>
    </View>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    wrapper: {
      padding: spacing[2],
    },
    translucent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderColor: colors.divider,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    attachmentContainer: {
      paddingLeft: spacing[10],
      marginBottom: spacing[2],
    },
    actionButton: {
      opacity: Platform.select({ ios: 0.8 }),
      padding: spacing[1.5],
    },
  });
