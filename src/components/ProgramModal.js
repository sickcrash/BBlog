import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { X, Check, Pencil, Trash2 } from 'lucide-react-native';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
`;

const Content = styled.View`
  width: 80%;
  background-color: white;
  border-radius: 14px;
  padding: 16px;
  max-height: 60%;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const ProgramItem = styled.TouchableOpacity`
  padding: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ProgramRowLeft = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

const ProgramText = styled.Text`
  font-size: 16px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  margin-right: 8px;
`;

const NewProgramRow = styled.View`
  flex-direction: row;
  margin-top: 16px;
  align-items: center;
`;

const Input = styled.TextInput`
  flex: 1;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 8px;
  margin-right: 8px;
`;

const EditInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 0;
  margin: 0;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.primary};
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 10px;
  border-radius: 8px;
`;

const ActionButton = styled.TouchableOpacity`
    padding: 4px;
    margin-left: 8px;
`;

const ResetButton = styled.TouchableOpacity`
    margin-top: 20px;
    background-color: #FF3B30;
    padding: 12px;
    border-radius: 8px;
    align-items: center;
`;

const ResetText = styled.Text`
    color: white;
    font-weight: bold;
`;

export default function ProgramModal({ visible, onClose }) {
  const { programs, currentProgram, setCurrentProgram, addProgram, updateProgram, deleteProgram, resetAllData } = useWorkout();
  const [newProgramName, setNewProgramName] = useState('');
  const [editingProgram, setEditingProgram] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleSelect = (program) => {
    if (editingProgram) return;
    setCurrentProgram(program.id);
    onClose();
  };

  const handleAdd = () => {
    if (newProgramName.trim()) {
      addProgram(newProgramName.trim());
      setNewProgramName('');
    }
  };

  const startEdit = (program) => {
      setEditingProgram(program);
      setEditValue(program);
  };

  const submitEdit = () => {
      if (editingProgram && editValue.trim()) {
          updateProgram(editingProgram, editValue.trim());
      }
      setEditingProgram(null);
  };

  const handleDelete = (program) => {
      Alert.alert(
          "Delete Program",
          "Are you sure you want to delete this program and all its logs?",
          [
              { text: "Cancel", style: "cancel" },
              {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                      deleteProgram(program.id);
                      setEditingProgram(null);
                  }
              }
          ]
      );
  };

  const handleReset = () => {
      Alert.alert(
          "Reset All Data",
          "This will wipe all app data properly. Cannot be undone.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: resetAllData }
          ]
      );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ModalContainer>
        <Content>
          <HeaderRow>
            <Title>Programs</Title>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </HeaderRow>

          <FlatList
            data={programs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ProgramItem onPress={() => handleSelect(item)}>
                <ProgramRowLeft>
                    {editingProgram?.id === item.id ? (
                        <EditInput
                            value={editValue}
                            onChangeText={setEditValue}
                            onBlur={submitEdit}
                            onSubmitEditing={submitEdit}
                            autoFocus
                        />
                    ) : (
                        <>
                            <ProgramText active={item.id === currentProgram}>{item.name}</ProgramText>
                            {item.id === currentProgram && <Check size={16} color="#007AFF" />}
                        </>
                    )}
                </ProgramRowLeft>

                {editingProgram?.id === item.id ? (
                     <ActionButton onPress={() => handleDelete(item)}>
                         <Trash2 size={20} color="#FF3B30" />
                     </ActionButton>
                ) : (
                    <ActionButton onPress={() => startEdit(item)}>
                        <Pencil size={16} color="#8E8E93" />
                    </ActionButton>
                )}
              </ProgramItem>
            )}
          />

          <NewProgramRow>
            <Input
              value={newProgramName}
              onChangeText={setNewProgramName}
              placeholder="New Program Name"
            />
            <AddButton onPress={handleAdd}>
              <Text style={{color: 'white', fontWeight: '600'}}>Add</Text>
            </AddButton>
          </NewProgramRow>

          <ResetButton onPress={handleReset}>
              <ResetText>Reset All Data (Debug)</ResetText>
          </ResetButton>
        </Content>
      </ModalContainer>
    </Modal>
  );
}
