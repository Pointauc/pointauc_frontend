import { Modal, rem } from '@mantine/core';

import classes from './index.module.css';

const ModalExtended = Modal.extend({
  classNames: classes,
  // vars: (theme, props) => {
  // Customize modal sizes here
  // if (props.size === 'xl') {
  //   return {
  //     root: {
  //       '--modal-size': rem(1200),
  //     },
  //   };
  // }

  // You can add other custom sizes too
  // if (props.size === 'xxl') {
  //   return {
  //     root: {
  //       '--modal-size': rem(1400),
  //     },
  //   };
  // }

  //   return { root: {} };
  // },
});

export default ModalExtended;
