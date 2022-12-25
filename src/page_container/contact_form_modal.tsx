import {
  EuiButton,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiTextArea,
  EuiFieldText,
  EuiCallOut,
  EuiTitle,
} from '@elastic/eui';
import axios from 'axios';
import React, { ChangeEvent, MouseEventHandler, useCallback, useContext, useState } from 'react';
import { AsyncData } from '../model';
import { PageContext } from './page_context';

export interface ContactFormModalProps {
  onClose: () => void;
}

export function ContactFormModal({ onClose }: ContactFormModalProps) {
  const { getApiURL } = useContext(PageContext);
  const [message, setMessage] = useState<string>('');
  const onMessageChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  const [email, setEmail] = useState<string>('');
  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const [sendingStatus, setSendingStatus] = useState<AsyncData<null> | null>(null);
  const onMessageSend: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (sendingStatus?.status === 'pending') {
        return;
      }

      setSendingStatus({ status: 'pending' });
      axios.post(getApiURL('/api/send_message'), email ? { message, email } : { message }).then(
        () => {
          setSendingStatus({ status: 'succeeded', data: null });
          setMessage('');
          setEmail('');
        },
        (err: Error) => {
          setSendingStatus({ status: 'failed', error: err?.message ?? err });
        },
      );
    },
    [email, message, sendingStatus],
  );

  const sendingStatusCallout =
    sendingStatus?.status === 'succeeded' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="Your message has been successfully sent." color="success" iconType="check" />
      </EuiFormRow>
    ) : sendingStatus?.status === 'failed' ? (
      <EuiFormRow>
        <EuiCallOut size="s" title="An error occurred, please try again later" color="danger" iconType="alert" />
      </EuiFormRow>
    ) : undefined;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size={'s'}>
            <h1>Contact Us</h1>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiForm id="contact-form" component="form">
          {sendingStatusCallout}
          <EuiFormRow label="Message">
            <EuiTextArea
              placeholder="Include any question, suggestion, feedback you would like to share or email us directly to contact@secutils.dev."
              value={message}
              onChange={onMessageChange}
            />
          </EuiFormRow>
          <EuiFormRow label="Your email (optional)">
            <EuiFieldText value={email} type={'email'} onChange={onEmailChange} />
          </EuiFormRow>
        </EuiForm>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton
          type="submit"
          form="contact-form"
          fill
          onClick={onMessageSend}
          isLoading={sendingStatus?.status === 'pending'}
          isDisabled={message.trim().length === 0}
        >
          Send
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
