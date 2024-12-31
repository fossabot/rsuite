import React, { useContext } from 'react';
import CloseButton from '@/internals/CloseButton';
import IconButton from '../IconButton';
import { useClassNames } from '@/internals/hooks';
import { createChainedFunction } from '@/internals/utils';
import { ModalContext } from './ModalContext';
import { WithAsProps, RsRefForwardingComponent } from '@/internals/types';

export interface ModalHeaderProps extends WithAsProps {
  /** Primary content */
  children?: React.ReactNode;

  /** Display close button */
  closeButton?: boolean;

  /** Called when Modal is hidden */
  onClose?: (event: React.MouseEvent) => void;
}

const ModalHeader: RsRefForwardingComponent<'div', ModalHeaderProps> = React.forwardRef(
  (props: ModalHeaderProps, ref) => {
    const {
      as: Component = 'div',
      classPrefix = 'modal-header',
      className,
      closeButton = true,
      children,
      onClose,
      ...rest
    } = props;
    const { merge, withClassPrefix, prefix } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix());

    const context = useContext(ModalContext);
    const { isDrawer, onModalClose } = context || {};

    return (
      <Component {...rest} ref={ref} className={classes}>
        {closeButton && (
          <CloseButton
            as={isDrawer ? IconButton : 'button'}
            className={prefix('close')}
            onClick={createChainedFunction(onClose, onModalClose)}
          />
        )}
        {children}
      </Component>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export default ModalHeader;
