import { FC, ReactElement, useCallback, useRef, useState } from 'react';
import { Button, Fade, Paper, Popper } from '@mui/material';
import './ImagePresetsInput.scss';
// @ts-ignore
import { CloudinaryContext, Image, Transformation } from 'cloudinary-react';

import { getCloudifyUrl } from '@utils/url.utils.ts';

interface ImagePresetsInputProps {
  images: string[];
  buttonTitle: string;
  onChange: (imageLink: string) => void;
  dialogTitle?: string;
}

const ImagePresetsInput: FC<ImagePresetsInputProps> = ({ buttonTitle, images, onChange }) => {
  const anchorEl = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const togglePopper = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const createImageSelectHandler = useCallback(
    (image: string) => (): void => {
      onChange(getCloudifyUrl(image));
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div>
      <Popper open={open} anchorEl={anchorEl.current} placement='top' transition>
        {({ TransitionProps }): ReactElement => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <CloudinaryContext cloudName='dn4ue0pj9' className='image-container'>
                {images.map((image) => (
                  <Button key={image} className='image-item' onClick={createImageSelectHandler(image)}>
                    <div className='image-item-shadow' />
                    <Image publicId={image} secure='true'>
                      <Transformation width='200' crop='scale' />
                    </Image>
                  </Button>
                ))}
              </CloudinaryContext>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Button variant='outlined' color='primary' onClick={togglePopper} ref={anchorEl}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default ImagePresetsInput;
