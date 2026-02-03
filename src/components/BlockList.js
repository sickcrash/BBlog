import React from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import styled from 'styled-components/native';
import TextBlock from './TextBlock';
import ExerciseBlock from './ExerciseBlock';
import { Plus, Trash2 } from 'lucide-react-native';

const AddButtonContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 16px;
  gap: 16px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.highlight};
  padding: 10px 20px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const AddButtonText = styled.Text`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  margin-left: 8px;
`;

const ClearButton = styled.TouchableOpacity`
  margin-top: 16px;
  margin-bottom: 32px;
  align-self: center;
  flex-direction: row;
  align-items: center;
`;

const ClearButtonText = styled.Text`
  color: #FF3B30;
  font-weight: 600;
  margin-left: 8px;
`;

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ContentArea = styled.View`
  padding-bottom: 100px;
`;

export default function BlockList({ blocks = [], onUpdateBlocks }) {

  const handleUpdateBlock = (index, newBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    onUpdateBlocks(newBlocks);
  };

  const handleAddBlock = (type) => {
    const newBlock = type === 'exercise'
      ? { type: 'exercise', title: '', content: '' }
      : { type: 'text', content: '' };
    onUpdateBlocks([...blocks, newBlock]);
  };

  const handleDeleteBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onUpdateBlocks(newBlocks);
  };

  const handleClearLog = () => {
    onUpdateBlocks([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <Container contentContainerStyle={{ paddingBottom: 100 }}>
        <ContentArea>
          {blocks.map((block, index) => {
            if (block.type === 'exercise') {
              return (
                <ExerciseBlock
                  key={index}
                  title={block.title}
                  content={block.content}
                  onTitleChange={(text) => handleUpdateBlock(index, { ...block, title: text })}
                  onContentChange={(text) => handleUpdateBlock(index, { ...block, content: text })}
                  onDelete={() => handleDeleteBlock(index)}
                />
              );
            } else {
              return (
                <TextBlock
                  key={index}
                  content={block.content}
                  onChange={(text) => handleUpdateBlock(index, { ...block, content: text })}
                  onDelete={() => handleDeleteBlock(index)}
                />
              );
            }
          })}

          <AddButtonContainer>
            <AddButton onPress={() => handleAddBlock('exercise')}>
              <Plus size={20} color="#007AFF" />
              <AddButtonText>Exercise</AddButtonText>
            </AddButton>
            <AddButton onPress={() => handleAddBlock('text')}>
              <Plus size={20} color="#007AFF" />
              <AddButtonText>Note</AddButtonText>
            </AddButton>
          </AddButtonContainer>

          {blocks.length > 0 && (
             <ClearButton onPress={handleClearLog}>
                <Trash2 size={20} color="#FF3B30" />
                <ClearButtonText>Clear Log</ClearButtonText>
             </ClearButton>
          )}

        </ContentArea>
      </Container>
    </KeyboardAvoidingView>
  );
}
