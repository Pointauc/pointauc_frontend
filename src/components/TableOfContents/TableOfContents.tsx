import { FC } from 'react';

import { Paragraph } from '@models/common.model.ts';
import './TableOfContents.scss';

interface TableOfContentsProps {
  paragraphs: Paragraph[];
  url: string;
}

const TableOfContents: FC<TableOfContentsProps> = ({ paragraphs, url }) => {
  return (
    <div className='table-of-contents'>
      <div className='content'>
        <div className='title'>Содержание</div>
        <ul className='table-of-contents-list'>
          {paragraphs.map(({ title, key }) => (
            <li key={key} className='paragraph'>
              <a href={`${url}#${key}`}>{title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TableOfContents;
