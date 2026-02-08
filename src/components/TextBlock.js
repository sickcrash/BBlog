import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { X, GripVertical } from 'lucide-react-native';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.colors.background};
  min-height: 40px;
`;

const DragHandle = styled.TouchableOpacity`
  padding: 8px;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.View`
  flex: 1;
  position: relative;
`;

const Input = styled.TextInput`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.regular};
  padding-right: 24px;
`;

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 10;
`;

export default function TextBlock({ content, onUpdate, onFocus, onDelete, placeholder, drag }) {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleBlur = () => {
    if (localContent !== content) {
      onUpdate(localContent);
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
        <Input
          multiline
          value={localContent}
          onChangeText={setLocalContent}
          onBlur={handleBlur}
          placeholder={placeholder || "Write a note..."}
          placeholderTextColor="#999"
          scrollEnabled={false}
          onFocus={onFocus}
        />
      </ContentContainer>
    </Container>
  );
}
