import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { X, Check } from 'lucide-react-native';

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

const ProgramText = styled.Text`
  font-size: 16px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
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

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 10px;
  border-radius: 8px;
`;

export default function ProgramModal({ visible, onClose }) {
  const { programs, currentProgram, setCurrentProgram, addProgram } = useWorkout();
  const [newProgramName, setNewProgramName] = useState('');

  const handleSelect = (program) => {
    setCurrentProgram(program);
    onClose();
  };

  const handleAdd = () => {
    if (newProgramName.trim()) {
      addProgram(newProgramName.trim());
      setNewProgramName('');
    }
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
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <ProgramItem onPress={() => handleSelect(item)}>
                <ProgramText active={item === currentProgram}>{item}</ProgramText>
                {item === currentProgram && <Check size={16} color="#007AFF" />}
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
        </Content>
      </ModalContainer>
    </Modal>
  );
}
