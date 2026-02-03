import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { generateMarkedDates } from '../utils/calendarUtils';
import { X } from 'lucide-react-native';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
`;

const Content = styled.View`
  width: 90%;
  background-color: white;
  border-radius: 14px;
  padding: 16px;
  max-height: 80%;
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

const Controls = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
  justify-content: space-between;
`;

const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 10px 16px;
  border-radius: 8px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: 600;
`;

const Input = styled.TextInput`
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 8px;
  width: 60px;
  text-align: center;
`;

export default function CalendarModal({ visible, onClose, onSelectDate }) {
  const { calendarRanges, setCalendarRanges } = useWorkout();
  const [selectedDate, setSelectedDate] = useState('');
  const [weeks, setWeeks] = useState('6');

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleGoToDate = () => {
    if (selectedDate && onSelectDate) {
      onSelectDate(selectedDate);
    }
  };

  const handleSetRange = () => {
    if (!selectedDate) return;

    const newRange = {
      startDate: selectedDate,
      durationWeeks: parseInt(weeks) || 6,
      color: '#007AFF'
    };

    setCalendarRanges([...calendarRanges, newRange]);
    setSelectedDate('');
  };

  const marked = generateMarkedDates(calendarRanges);

  if (selectedDate) {
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#FF9500'
    };
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ModalContainer>
        <Content>
          <HeaderRow>
            <Title>Smart Calendar</Title>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </HeaderRow>

          <Calendar
            markingType={'period'}
            markedDates={marked}
            onDayPress={handleDayPress}
            theme={{
              arrowColor: '#007AFF',
              todayTextColor: '#007AFF',
            }}
          />

          <Controls>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text>Weeks: </Text>
              <Input
                value={weeks}
                onChangeText={setWeeks}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <Button onPress={handleSetRange}>
              <ButtonText>Start Cycle</ButtonText>
            </Button>
          </Controls>

          {selectedDate ? (
            <Button
              onPress={handleGoToDate}
              style={{marginTop: 12, backgroundColor: '#E5E5EA', width: '100%', alignItems: 'center'}}
            >
              <ButtonText style={{color: '#007AFF'}}>Go to Selected Date</ButtonText>
            </Button>
          ) : null}
        </Content>
      </ModalContainer>
    </Modal>
  );
}
