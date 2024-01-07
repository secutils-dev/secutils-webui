import { EuiIcon, EuiText } from '@elastic/eui';

import type { Responder } from './responder';

export function ResponderName({ responder }: { responder: Responder }) {
  if (!responder.settings.script) {
    return responder.name;
  }

  return (
    <EuiText size="s">
      {responder.name} {<EuiIcon type={'function'} size="s" title={'Responder generates responses dynamically'} />}
    </EuiText>
  );
}
