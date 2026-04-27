import { modals } from '@mantine/modals';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import i18next from 'i18next';

import { appendDomainToAllowList, getDomainFromUrl } from '@domains/links/lib/url';
import { saveSettings } from '@reducers/AucSettings/AucSettings';
import { store } from '@store';
import ExternalRedirectConfirmationModalContent, {
  type ExternalRedirectCheckboxesState,
} from '@domains/links/ui/ExternalRedirectConfirmationModalContent';

import type { AucSettingsState } from '@reducers/AucSettings/AucSettings';

interface OpenExternalRedirectConfirmationModalProps {
  href: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const openExternalRedirectConfirmationModal = ({
  href,
  onConfirm,
  onCancel,
}: OpenExternalRedirectConfirmationModalProps) => {
  let modalState: ExternalRedirectCheckboxesState = {
    isAddDomainToAllowListEnabled: false,
    isIgnoreExternalLinkConfirmationEnabled: false,
  };

  const domain = getDomainFromUrl(href);

  const handleConfirm = () => {
    const nextSettings: Partial<AucSettingsState['settings']> = {};
    const currentSettings = store.getState().aucSettings.settings;

    if (modalState.isAddDomainToAllowListEnabled && domain) {
      nextSettings.allowedDomains = appendDomainToAllowList(currentSettings.allowedDomains ?? [], domain);
    }

    if (modalState.isIgnoreExternalLinkConfirmationEnabled) {
      nextSettings.ignoreExternalLinkConfirmation = true;
    }

    if (Object.keys(nextSettings).length > 0) {
      void store.dispatch(saveSettings(nextSettings));
    }

    onConfirm();
  };

  modals.openConfirmModal({
    title: i18next.t('common.externalLinkWarning'),
    centered: true,
    size: 'lg',
    labels: {
      confirm: i18next.t('common.openLink'),
      cancel: i18next.t('common.cancel'),
    },
    confirmProps: {
      color: 'orange',
      leftSection: <OpenInNewIcon fontSize='small' />,
    },
    children: (
      <ExternalRedirectConfirmationModalContent
        href={href}
        domain={domain}
        onStateChange={(nextState) => {
          modalState = nextState;
        }}
      />
    ),
    onConfirm: handleConfirm,
    onCancel,
  });
};

export default openExternalRedirectConfirmationModal;
