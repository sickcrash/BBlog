import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { X, GripVertical } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: 0;
  margin: 8px 16px;
  background-color: ${props => props.theme.colors.background};
  min-height: 60px;
`;

const DragHandle = styled.TouchableOpacity`
  padding: 8px;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-left: 12px;
  border-left-width: 2px;
  border-left-color: ${props => props.theme.colors.primary};
  position: relative;
`;

const TitleInput = styled.TextInput`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
  padding-right: 24px;
`;

const ContentInput = styled.TextInput`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  line-height: 24px;
`;

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px;
  z-index: 10;
`;

export default function ExerciseBlock({ title, content, onUpdate, onFocus, onDelete, placeholder, drag }) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleTitleBlur = () => {
    if (localTitle !== title) {
      onUpdate({ title: localTitle });
    }
  };

  const handleContentBlur = () => {
    if (localContent !== content) {
      onUpdate({ content: localContent });
    }
  };

  return (
    <Container>
      {drag && (
        <DragHandle onLongPress={drag}>
          <GripVertical size={20} color="#C7C7CC" />
        </DragHandle>
      )}
      <ContentContainer>
        {onDelete && (
          <DeleteButton onPress={onDelete}>
            <X size={16} color="#8E8E93" />
          </DeleteButton>
        )}
        <TitleInput
          value={localTitle}
          onChangeText={setLocalTitle}
          onBlur={handleTitleBlur}
          placeholder="Exercise Name"
          placeholderTextColor="#999"
          onFocus={onFocus}
        />
        <ContentInput
          multiline
          value={localContent}
          onChangeText={setLocalContent}
          onBlur={handleContentBlur}
          placeholder={placeholder || "Sets x Reps @ Weight..."}
          placeholderTextColor="#999"
          scrollEnabled={false}
          onFocus={onFocus}
        />
      </ContentContainer>
    </Container>
  );
}
