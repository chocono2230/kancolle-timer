import { Box, Container, List } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import EditTimer from './EditTimer';
import ShowTimer from './ShowTimer';
import useTimerIndex from './useIndexTimer';

const Timer = () => {
  const { timersArray, organizeAfterDelete, changeTimerOrder } = useTimerIndex();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = timersArray.findIndex((v) => v.id === active.id);
      const newIndex = timersArray.findIndex((v) => v.id === over.id);
      changeTimerOrder(oldIndex, newIndex);
    }
  };

  return (
    <>
      <Container maxWidth='sm'>
        <Box sx={{ minWidth: '450px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={timersArray} strategy={verticalListSortingStrategy}>
              <List>
                {timersArray &&
                  timersArray.map((t) => {
                    return <ShowTimer key={t.id} timer={t} organizeAfterDelete={organizeAfterDelete} />;
                  })}
              </List>
            </SortableContext>
          </DndContext>
          <Box sx={{ m: 2 }}>
            <EditTimer timerListSize={timersArray.length} />
          </Box>
        </Box>
      </Container>
    </>
  );
};
export default Timer;
