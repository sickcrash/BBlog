import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { X } from 'lucide-react-native';

const Container = styled.View`
  padding-left: 12px;
  margin: 8px 16px;
  border-left-width: 2px;
  border-left-color: ${props => props.theme.colors.primary};
  position: relative;
  min-height: 60px;
  background-color: ${props => props.theme.colors.background};
  width: 90%;
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

export default function ExerciseBlock({ title, content, onUpdate, onFocus, onDelete, placeholder }) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localContent, setLocalContent] = useState(content);

  // Sync with props if they change externally (e.g. initial load or drag swap)
  // We use a ref to prevent sync if we are the ones editing.
  // Actually, simplest is to sync only when prop is different and we are NOT focused?
  // But we might be swapped while focused.
  // Standard pattern: Sync on prop change.
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
    </Container>
  );
}
