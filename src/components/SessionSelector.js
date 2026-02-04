import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { Plus, X } from 'lucide-react-native';
import { TextInput, Alert, TouchableOpacity } from 'react-native';

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

const ChipContent = styled.View`
  flex-direction: row;
  align-items: center;
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

const DeleteButton = styled.TouchableOpacity`
  margin-left: 8px;
  padding: 4px;
`;

export default function SessionSelector({ selectedSession, onSelect }) {
  const { sessions, addSession, updateSession, deleteSession } = useWorkout();
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
      if (selectedSession === editingSession) {
          onSelect(editValue.trim());
      }
    }
    setEditingSession(null);
  };

  const handleDelete = (session) => {
      Alert.alert(
          "Delete Session",
          `Are you sure you want to delete "${session}"?`,
          [
              { text: "Cancel", style: "cancel" },
              {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                      deleteSession(session);
                      setEditingSession(null);
                      if (selectedSession === session) {
                          onSelect(null);
                      }
                  }
              }
          ]
      );
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
              <ChipContent>
                <EditInput
                  value={editValue}
                  onChangeText={setEditValue}
                  onBlur={handleSubmit}
                  onSubmitEditing={handleSubmit}
                  autoFocus
                  returnKeyType="done"
                />
                <DeleteButton
                    onPress={() => handleDelete(session)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={16} color="white" />
                </DeleteButton>
              </ChipContent>
            ) : (
              <ChipContent>
                 <ChipText selected={selectedSession === session}>{session}</ChipText>
              </ChipContent>
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
