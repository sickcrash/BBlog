import React from 'react';
import { KeyboardAvoidingView, Platform, Text, View, TouchableOpacity, FlatList } from 'react-native';
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

// Use TouchableOpacity for static buttons to ensure they work reliably
const AddButton = styled(TouchableOpacity)`
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

const ClearButton = styled(TouchableOpacity)`
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
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    const newBlock = type === 'exercise'
      ? { type: 'exercise', title: '', content: '', id: uniqueId }
      : { type: 'text', content: '', id: uniqueId };
    onUpdateBlocks([...blocks, newBlock]);
  };

  const handleDeleteBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onUpdateBlocks(newBlocks);
  };

  const handleClearLog = () => {
    onUpdateBlocks([]);
  };

  const renderItem = ({ item, index }) => {
    return (
        <View
          style={{
             minHeight: 50,
             width: '100%',
             marginBottom: 8
          }}
        >
          {item.type === 'exercise' ? (
             <ExerciseBlock
               title={item.title}
               content={item.content}
               placeholder={item.placeholder}
               onTitleChange={(text) => handleUpdateBlock(index, { ...item, title: text })}
               onContentChange={(text) => handleUpdateBlock(index, { ...item, content: text })}
               onDelete={() => handleDeleteBlock(index)}
             />
          ) : (
             <TextBlock
               content={item.content}
               placeholder={item.placeholder}
               onChange={(text) => handleUpdateBlock(index, { ...item, content: text })}
               onDelete={() => handleDeleteBlock(index)}
             />
          )}
        </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={blocks}
        extraData={blocks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        ListFooterComponent={() => (
           <View>
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
           </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}
