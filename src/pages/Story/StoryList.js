import React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { Link, useNavigate } from 'react-router-dom';

const StoryList = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([]);

  useEffect(() => {
     fetchApi();
  }, []);
  
  const fetchApi = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_host}/content-service/v1/collection`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPosts(data);
      localStorage.setItem('selectedStoryTitle', data.title);
      localStorage.setItem('sentenceCounter',0)
    } catch (error) {
      console.error(error.message);
    }
  }
  
  const selectStoryTitle = (storyTitle) =>{
    localStorage.setItem('storyTitle', storyTitle)
    localStorage.setItem('apphomelang', 'hi');
  }

  const backToHome=()=>{
    navigate('/')
    localStorage.setItem('apphomelang','en')
  }

  
      return (
        <section className="bg">
          <Button className='btn btn-success' onClick={backToHome}>Back to Home</Button>
          <div className="container">
            <div className="row">
              <h1 style={{ textAlign: 'center', }}>My Stories</h1>
              {posts?.data?.map((post, ind) => (
                <Link to={`story/${post.collectionId}`} key={ind}>
                  <Box
                    onClick={() => selectStoryTitle(post.title)}
                    borderWidth="1px"
                    borderRadius="10px"
                    overflow="hidden"
                    width="350px"
                    backgroundColor="white"
                    margin="2% 5% 0% 0%"
                    display={'inline-block'}
                    boxShadow="md"
                    _hover={{ boxShadow: 'lg' }}
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      width="100%"
                      height="auto"
                    />
                    <Box textAlign={'center'} p="4">
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        lineHeight="1.1"
                        mb="2"
                        color={'black'}
                      >
                        {post.title}
                      </Text>
                    </Box>
                  </Box>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
}

export default StoryList