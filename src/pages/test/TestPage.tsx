import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Stack } from '@mui/material';
import { shuffle } from 'es-toolkit';

const TestPage = () => {
  'use no memo';
  const [items, setItems] = useState([0, 1, 2]);
  const add = () => setItems([...items, items.length]);
  const handleShuffle = () => setItems(shuffle(items));
  return (
    <Stack>
      <Button variant='contained' onClick={add}>
        Add number
      </Button>

      <Button variant='contained' onClick={handleShuffle}>
        Shuffle
      </Button>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item}
            layout // This single prop handles reordering animation!
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  );
};

export default TestPage;
