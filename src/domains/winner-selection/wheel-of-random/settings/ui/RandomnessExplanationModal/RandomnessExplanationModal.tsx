import { Modal, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ROUTES from '@constants/routes.constants';

import IntroView from './IntroView';
import SourcesView from './SourcesView';
import classes from './RandomnessExplanationModal.module.css';

interface RandomnessExplanationModalProps {
  opened: boolean;
  onClose: () => void;
  initialTab?: 'local-basic' | 'random-org' | 'verifiable';
}

type ViewMode = 'intro' | 'sources';
type RandomnessSource = 'local-basic' | 'random-org' | 'verifiable';

const STORAGE_KEY = 'randomnessModalState';

const RandomnessExplanationModal = ({ opened, onClose, initialTab }: RandomnessExplanationModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('intro');
  const [activeTab, setActiveTab] = useState<RandomnessSource>('local-basic');

  // Load saved state from localStorage or use initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setView('sources');
    } else {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const { view: savedView, activeTab: savedTab } = JSON.parse(savedState);
          const isKnownTab = ['local-basic', 'random-org', 'verifiable'].includes(savedTab);

          setView(savedView || 'intro');
          setActiveTab(isKnownTab ? savedTab : 'local-basic');
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [initialTab]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ view, activeTab }));
  }, [view, activeTab]);

  const handleSourceClick = (source: RandomnessSource) => {
    setActiveTab(source);
    setView('sources');
  };

  const handleBackToIntro = () => {
    setView('intro');
  };

  const handleViewTechnicalDetails = () => {
    navigate(ROUTES.TICKET_VERIFICATION_INFO);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={3} c='dimmed'>
          {t('wheel.randomnessModal.title')}
        </Title>
      }
      size='xl'
      centered
      padding='lg'
      className={classes.modal}
    >
      {view === 'intro' ? (
        <IntroView onSourceClick={handleSourceClick} />
      ) : (
        <SourcesView
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBackToIntro={handleBackToIntro}
          onViewTechnicalDetails={handleViewTechnicalDetails}
        />
      )}
    </Modal>
  );
};

export default RandomnessExplanationModal;
