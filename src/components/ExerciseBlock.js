import React from 'react';
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

export default function ExerciseBlock({ title, content, onTitleChange, onContentChange, onFocus, onDelete, placeholder }) {
  return (
    <Container>
      {onDelete && (
        <DeleteButton onPress={onDelete}>
          <X size={16} color="#8E8E93" />
        </DeleteButton>
      )}
      <TitleInput
        value={title}
        onChangeText={onTitleChange}
        placeholder="Exercise Name"
        placeholderTextColor="#999"
        onFocus={onFocus}
      />
      <ContentInput
        multiline
        value={content}
        onChangeText={onContentChange}
        placeholder={placeholder || "Sets x Reps @ Weight..."}
        placeholderTextColor="#999"
        scrollEnabled={false}
        onFocus={onFocus}
      />
    </Container>
  );
}
