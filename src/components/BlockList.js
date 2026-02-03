import React from 'react';
import { KeyboardAvoidingView, Platform, Text } from 'react-native';
import styled from 'styled-components/native';
import { format } from 'date-fns';
import { useWorkout } from '../context/WorkoutContext';
import TextBlock from './TextBlock';
import ExerciseBlock from './ExerciseBlock';
import { Plus } from 'lucide-react-native';

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

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ContentArea = styled.View`
  padding-bottom: 100px;
`;

export default function BlockList({ date }) {
  const { logs, updateLog } = useWorkout();
  const logData = logs[date];
  const blocks = logData?.blocks || [];
  const lastModified = logData?.lastModified;

  const handleUpdateBlock = (index, newBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    updateLog(date, newBlocks);
  };

  const handleAddBlock = (type) => {
    const newBlock = type === 'exercise'
      ? { type: 'exercise', title: '', content: '' }
      : { type: 'text', content: '' };
    updateLog(date, [...blocks, newBlock]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <Container contentContainerStyle={{ paddingBottom: 100 }}>
        <ContentArea>
          {lastModified && (
            <Text style={{textAlign: 'center', color: '#8E8E93', marginVertical: 10, fontSize: 12}}>
              Last modified: {format(lastModified, "MMM d, h:mm a")}
            </Text>
          )}
          {blocks.map((block, index) => {
            if (block.type === 'exercise') {
              return (
                <ExerciseBlock
                  key={index}
                  title={block.title}
                  content={block.content}
                  onTitleChange={(text) => handleUpdateBlock(index, { ...block, title: text })}
                  onContentChange={(text) => handleUpdateBlock(index, { ...block, content: text })}
                />
              );
            } else {
              return (
                <TextBlock
                  key={index}
                  content={block.content}
                  onChange={(text) => handleUpdateBlock(index, { ...block, content: text })}
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
        </ContentArea>
      </Container>
    </KeyboardAvoidingView>
  );
}
