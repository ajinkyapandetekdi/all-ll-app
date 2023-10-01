import React, { useEffect, useState } from 'react';
import './Story.css';
import { Box, Button, Flex, Image, Text, VStack } from '@chakra-ui/react';
import VoiceCompair from '../../components/VoiceCompair/VoiceCompair';
import play from '../../assests/Images/play-img.png';
import pause from '../../assests/Images/pause-img.png';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const Story = () => {
  const [posts, setPosts] = useState(JSON.parse(localStorage.getItem('contents')));
  const [voiceText, setVoiceText] = useState('');
  localStorage.setItem('voiceText', voiceText.replace(/[.',|!|?']/g, ''));  
  const [recordedAudio, setRecordedAudio] = useState(''); // blob
  const [isAudioPlay, setIsAudioPlay] = useState(true);
  const [flag, setFlag] = useState(true);
  const [temp_audio, set_temp_audio] = useState(null); // base64url of teachertext
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const [currentLine, setCurrentLine] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (voiceText == '-') {
      alert("Sorry I couldn't hear a voice. Could you please speak again?");
      setVoiceText('');
    }
  }, [voiceText]);
  React.useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    localStorage.setItem(
      'virtualStorySessionID',
      localStorage.getItem('virtualID') + '' + Date.now()
    );
    try {
      const response = await fetch(
        `${process.env.REACT_APP_host}/content-service/v1/WordSentence/pagination?type=Sentence&collectionId=${slug}`
      )
        .then(res => {
          return res.json();
        })
        .then(data => {
          
          localStorage.removeItem('content_random_id');
          localStorage.setItem('content_random_id', -1);
          localStorage.setItem('pageno',1);
          let contentdata = []
          data.data.forEach((element, index) => {
             let contentObj = {};
             contentObj.title = element.title
             contentObj.type = element.type
             contentObj.hi = element.data[0].hi
             // contentObj.en = element.data[0]
             contentObj.image = element.image
             contentdata[index] = contentObj;
            });
            localStorage.setItem('apphomelevel','Word');
            localStorage.setItem('contents', JSON.stringify(contentdata));
            setPosts(JSON.parse(localStorage.getItem('contents')));
          setLoading(false);
        });

      setLoading(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  React.useEffect(() => {
    learnAudio();
  }, [temp_audio]);

  const playAudio = () => {
    set_temp_audio(new Audio(posts[currentLine].hi.audio));
  };

  const pauseAudio = () => {
    if (temp_audio !== null) {
      temp_audio.pause();
      setFlag(!false);
    }
  };

  const learnAudio = () => {
    if (temp_audio !== null) {
      temp_audio.play();
      setFlag(!flag);
      temp_audio.addEventListener('ended', () => setFlag(true));
    }
  };

  function findRegex(str) {
    var rawString = str;
    var regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
    var cleanString = rawString.replace(regex, '');
    return cleanString;
  }

  function saveIndb(output) {
    const utcDate = new Date().toISOString().split('T')[0];
    axios
      .post(`${process.env.REACT_APP_host}/learner/scores`, {
        taskType: 'asr',
        output: output.output,
        config: null,
        user_id: localStorage.getItem('virtualID'),
        session_id: localStorage.getItem('virtualStorySessionID'),
        date: utcDate,
        original_text: findRegex(localStorage.getItem('contentText')),
        response_text: findRegex(output.output[0].source),
        language: 'hi',
      })
      .then(res => {
        // console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    if (currentLine === posts?.length) {
      navigate('/result');
    }
  }, [currentLine]);

  return (
    <>
      <Header />
      <div className="story-container">
        <Flex gap={14}></Flex>
        <div
          style={{
            boxShadow: '2px 2px 15px 5px grey',
            border: '2px solid white',
            borderRadius: '30px',
          }}
          className="story-item"
        >
          <div className="row">
            {loading ? (
              <div>Loading...</div>
            ) : (
              posts?.map((post, ind) =>
                currentLine === ind ? (
                  <Flex key={ind}>
                    <Image
                      className="story-image"
                      src={
                        'data:image/jpeg;base64,' +
                        post?.image?.replace('data:image/jpeg;base64,', '')
                      }
                      alt={post?.title}
                    />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '40vh',
                      }}
                    >
                      <Box p="4">
                        <h1 style={{ fontSize: '55px', marginTop: '40px' }}>
                          {post?.hi?.text}
                        </h1>
                        {localStorage.setItem(
                          'contentText',
                          post?.hi?.text
                        )}
                      </Box>
                    </div>
                  </Flex>
                ) : (
                  ''
                )
              )
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              position: 'relative',
              bottom: '-220px',
              left: '-40%',
            }}
          >
            {currentLine === posts?.length ? (
              ''
            ) : (
              <>
                {isAudioPlay !== 'recording' && (
                  <VStack alignItems="center" gap="5">
                    {flag ? (
                      <img
                        className="play_btn"
                        src={play}
                        style={{ height: '72px', width: '72px' }}
                        onClick={() => playAudio()}
                        alt="play_audio"
                      />
                    ) : (
                      <img
                        className="play_btn"
                        src={pause}
                        style={{ height: '72px', width: '72px' }}
                        onClick={() => pauseAudio()}
                        alt="pause_audio"
                      />
                    )}
                    <h4
                      className="text-play m-0 "
                      style={{ position: 'relative' }}
                    >
                      Listen
                    </h4>
                  </VStack>
                )}
                <VStack>
                  <VoiceCompair
                    setVoiceText={setVoiceText}
                    setRecordedAudio={setRecordedAudio}                    
                    _audio={{ isAudioPlay: e => setIsAudioPlay(e) }}
                    flag={true}
                    setCurrentLine={setCurrentLine}
                    saveIndb={saveIndb}
                  />
                  {isAudioPlay === 'recording' ? (
                    <h4
                      style={{ position: 'relative', top: '-12px' }}
                      className="text-speak m-0"
                    >
                      Stop
                    </h4>
                  ) : (
                    <h4
                      style={{ position: 'relative', top: '-12px' }}
                      className="text-speak m-0"
                    >
                      Speak
                    </h4>
                  )}
                </VStack>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Story;
