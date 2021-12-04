import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { GladType } from '../../../models/Arena/Glad';
import GladPreviewInfo from './GladPreviewInfo/GladPreviewInfo';
import RadioButtonGroup, { Option } from '../../RadioButtonGroup/RadioButtonGroup';

interface ArenaGladsPreviewProps {
  allGlads: GladType[];
  selectedGlads: GladType[];
  candidates: GladType[];
}

enum FilterFormat {
  All,
  Candidates,
  Selected,
}

const options: Option<FilterFormat>[] = [
  { key: FilterFormat.All, value: 'Все' },
  { key: FilterFormat.Candidates, value: 'Кандидаты' },
  { key: FilterFormat.Selected, value: 'Выделенные' },
];

const ArenaGladsPreview: FC<ArenaGladsPreviewProps> = ({ allGlads, selectedGlads, candidates }) => {
  const [filterFormat, setFilterFormat] = useState<FilterFormat>(FilterFormat.All);
  const previousSelectedGlads = useRef<GladType[]>(selectedGlads);

  useEffect(() => {
    const isSelectFirstGlad = !previousSelectedGlads.current.length && selectedGlads.length;
    const isSelectionRemoved = !selectedGlads.length && previousSelectedGlads.current.length;

    if (isSelectFirstGlad && filterFormat !== FilterFormat.Selected) {
      setFilterFormat(FilterFormat.Selected);
    }

    if (isSelectionRemoved && filterFormat === FilterFormat.Selected) {
      setFilterFormat(FilterFormat.All);
    }

    previousSelectedGlads.current = selectedGlads;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGlads.length]);

  const visibleGlads = useMemo(() => {
    const dataMap = {
      [FilterFormat.All]: allGlads,
      [FilterFormat.Candidates]: candidates,
      [FilterFormat.Selected]: selectedGlads,
    };

    return dataMap[filterFormat];
  }, [allGlads, candidates, filterFormat, selectedGlads]);

  return (
    <div className="glads-info-wrapper">
      <RadioButtonGroup
        style={{ marginTop: 10 }}
        options={options}
        activeKey={filterFormat}
        onChangeActive={setFilterFormat}
      />
      <div className="glad-preview-list">
        {visibleGlads.map((glad) => (
          <GladPreviewInfo key={glad.id} glad={glad} />
        ))}
      </div>
    </div>
  );
};

export default ArenaGladsPreview;
