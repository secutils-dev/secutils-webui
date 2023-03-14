import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { EuiText } from '@elastic/eui';

import HelpPageContent from '../../components/help_page_content';

export default function Certificates() {
  const location = useLocation();

  useEffect(() => {
    const elementToScroll = document.getElementById(location.hash.replace('#', ''));
    if (elementToScroll) {
      setTimeout(() => {
        window.scrollTo({ top: elementToScroll.offsetTop - 48, behavior: 'smooth' });
      }, 250);
    }
  }, []);

  return (
    <HelpPageContent>
      <EuiText size="relative">
        <h2>What is a digital certificate?</h2>
        <p>
          A digital certificate, also known as an SSL/TLS certificate or public key certificate, is a digital document
          that verifies the identity of a website, server, or other digital entity, and allows secure communication
          between two parties by encrypting data sent over the internet. It contains information about the identity of
          the certificate holder, such as their name and public key, and is issued by a trusted third-party Certificate
          Authority (CA).
        </p>
      </EuiText>
    </HelpPageContent>
  );
}
