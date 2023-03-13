import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, ViewProps } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';

import { MessagingView } from '@lib/ui/components/MessagingView';

import { IS_ANDROID } from '../../../core/constants';
import { useReplyToTicket } from '../../../core/queries/ticketHooks';

interface Props {
  disabled?: boolean;
  ticketId: number;
  onLayout?: ViewProps['onLayout'];
}

export const TicketMessagingView = ({
  disabled,
  ticketId,
  onLayout,
}: Props) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>('');
  const [attachment, setAttachment] = useState<Blob>(null);

  const {
    mutateAsync: reply,
    isLoading,
    isSuccess,
  } = useReplyToTicket(ticketId);

  const onSend = () => {
    reply({
      ticketId: ticketId,
      attachment,
      message: message.trim().replace(/\n/g, '<br>'),
    }).catch(() => {
      Alert.alert(t('common.error'), t('ticketScreen.sendError'));
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setMessage('');
      setAttachment(null);
      Keyboard.dismiss();
    }
  }, [isSuccess]);

  const messagingView = (
    <MessagingView
      message={message}
      onMessageChange={setMessage}
      attachment={attachment}
      onAttachmentChange={setAttachment}
      loading={isLoading}
      disabled={disabled}
      onLayout={onLayout}
      onSend={onSend}
    />
  );

  if (IS_ANDROID) {
    return messagingView;
  }

  return (
    <KeyboardAccessoryView
      androidAdjustResize
      avoidKeyboard
      alwaysVisible
      hideBorder
      heightProperty="minHeight"
      style={{
        backgroundColor: 'transparent',
      }}
    >
      {messagingView}
    </KeyboardAccessoryView>
  );
};
