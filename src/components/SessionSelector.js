import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { Plus } from 'lucide-react-native';
import { TextInput } from 'react-native';

const Container = styled.View`
  padding-bottom: 8px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const Scroll = styled.ScrollView`
  padding-left: 16px;
`;

const Chip = styled.TouchableOpacity`
  background-color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.highlight};
  padding: 8px 16px;
  border-radius: 16px;
  margin-right: 8px;
  min-width: 60px;
  align-items: center;
  justify-content: center;
`;

const ChipText = styled.Text`
  color: ${props => props.selected ? 'white' : props.theme.colors.text};
  font-weight: 600;
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.highlight};
  padding: 8px;
  border-radius: 16px;
  margin-right: 16px;
  align-items: center;
  justify-content: center;
`;

const EditInput = styled.TextInput`
  color: white;
  font-weight: 600;
  padding: 0;
  margin: 0;
  min-width: 50px;
`;

export default function SessionSelector({ selectedSession, onSelect }) {
  const { sessions, addSession, updateSession } = useWorkout();
  const [editingSession, setEditingSession] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handlePress = (session) => {
    if (selectedSession === session) {
      // Already selected, enter edit mode
      setEditingSession(session);
      setEditValue(session);
    } else {
      // Select it
      onSelect(session);
      setEditingSession(null);
    }
  };

  const handleSubmit = () => {
    if (editingSession && editValue.trim()) {
      updateSession(editingSession, editValue.trim());
      // If we renamed the currently selected session, we might need to tell HomeScreen the new name?
      // But selectedSession prop is passed from parent.
      // Parent needs to know the new name if it relies on string matching.
      // The updateSession updates the list. The parent (HomeScreen) will re-render.
      // However, if HomeScreen holds `selectedSession` as a string, and that string is no longer in `sessions`,
      // we need to ensure HomeScreen updates its state.
      // Actually, standard react pattern: if I rename 'Push' to 'Push 2', 'selectedSession' in HomeScreen is still 'Push'.
      // So I should probably trigger onSelect with the new name.
      onSelect(editValue.trim());
    }
    setEditingSession(null);
  };

  return (
    <Container>
      <Scroll horizontal showsHorizontalScrollIndicator={false}>
        {sessions.map((session) => (
          <Chip
            key={session}
            selected={selectedSession === session}
            onPress={() => handlePress(session)}
            activeOpacity={0.7}
          >
            {editingSession === session ? (
              <EditInput
                value={editValue}
                onChangeText={setEditValue}
                onBlur={handleSubmit}
                onSubmitEditing={handleSubmit}
                autoFocus
                returnKeyType="done"
              />
            ) : (
              <ChipText selected={selectedSession === session}>{session}</ChipText>
            )}
          </Chip>
        ))}

        <AddButton onPress={() => addSession('New Session')}>
            <Plus size={20} color="#007AFF" />
        </AddButton>
      </Scroll>
    </Container>
  );
}
