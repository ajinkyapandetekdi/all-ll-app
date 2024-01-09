import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { end } from '../../services/telementryService';
import { Box, Button, Flex, Heading, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import TimerLogo from '../../assests/Images/timer.png'
import PowerLogo from '../../assests/Images/power_logo.png'
import { fetchPointerApi } from '../../utils/api/PointerApi';

const AppTimer = ({isLoggedIn, setIsLoggedIn}) => {
  
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [timeoutCount,setTimeOutCount] = useState(120)
  useEffect(() => {
    let interval;
    if (isLoggedIn && timer < 1800) {
      interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer + 1);
          if(formatTime(timer) >= "30:00"){
            setTimeOutCount((prevTimer) => prevTimer - 1)
          }
          if(formatTime(timer) == "30:00"){
            onOpen();
          }
          else if(formatTime(timer).slice(0, 2) >= 32){
            handleLogout();
          }
        }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn,timer,timeoutCount]);

  useEffect(() => {
    const fetchDataFromApi = async () => {
      try {
        const result = await fetchPointerApi();
        
        if (result && result.result) {
          localStorage.setItem('totalSessionPoints', result.result.totalSessionPoints);
          localStorage.setItem('totalUserPoints', result.result.totalUserPoints);
        } else {
          console.error('Unexpected response structure:', result);
        }
      } catch (error) {
        console.error('Error in component:', error);
      }
    };
  
    fetchDataFromApi();
  }, [isLoggedIn]);
  


  const handleLogout = () => {
    setIsLoggedIn(false);
    // addLessonApi();
    localStorage.setItem('totalSessionPoints',0)
    localStorage.setItem('totalUserPoints',0)
    const progressData = JSON.parse(localStorage.getItem('progressData'))
    localStorage.removeItem("virtualID");
    if(progressData && progressData[localStorage.getItem('practiceSession')]?.progressPercent){
      end({"summary": [{progress: progressData[localStorage.getItem('practiceSession')]?.progressPercent}], duration: timer });
    }
    else{
      end({})
    }
    setTimer(0)
    navigate('/Login')
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const timerStyles = {
    color: formatTime(timer).slice(0, 2) >= 25 && formatTime(timer).slice(0, 2) <= 30
      ? 'red'
      : 'black',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '55px',
        textAlign: 'right',
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '10px',
        width:'100%'
      }}
    >
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Log Out</ModalHeader>
    <ModalCloseButton onClick={onClose} />
    <ModalBody>
      <Box textAlign={'center'} alignItems={'center'} gap={'2'}>
        <Heading>
          {timeoutCount}
        </Heading>
        <Text>
          Congratulations!! You have completed the session. Please Log In again to Continue...
        </Text>
      </Box>
    </ModalBody>

    <ModalFooter>
      <Button colorScheme='blue' mr={3} onClick={onClose}>
        Close
      </Button>
      <Button
        border="2px"
        borderColor="red.500"
        color={'red'}
        onClick={handleLogout}
        cursor={'pointer'}
        mr={3}
      >
        Logout
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
      {isLoggedIn && (
        <Flex pos={'absolute'} right={0}  w={'100%'}>
        <Box textAlign={'start'} pl={5}>
        {/* <Text>Total Points:- {localStorage.getItem('totalUserPoints')}</Text>
        <Text>Current Points:- {localStorage.getItem('totalSessionPoints')}</Text> */}
        </Box>
        <Box  style={{ position: 'absolute', textAlign: 'center', right:'0' }}>
          <div
            style={{
              visibility:
              formatTime(timer).slice(0, 2) >= 25 &&
              formatTime(timer).slice(0, 2) <= 30 &&
              formatTime(timer).slice(3, 5) % 2 === 0
                  ? 'hidden'
                  : 'visible', textAlign:'center', display:'flex', alignItems:'center', gap:'10px'
            }}
          >
            <Image src={TimerLogo} height={'35px'} alt="timer_logo" />
            <p style={timerStyles}>{formatTime(timer)}</p>
          </div>
          <Flex alignItems={'center'} gap={'2'}>
            <Text fontSize={'17px'}>Score: {localStorage.getItem('totalUserPoints')}</Text>
            <Box display={'flex'} gap={5} >
              
            <Image height={'35px'} src={PowerLogo}   onClick={handleLogout}
              cursor={'pointer'} alt="" />
              </Box>
          </Flex>
        </Box>
              </Flex>
      )}
    </div>
  );
};

export default AppTimer;
