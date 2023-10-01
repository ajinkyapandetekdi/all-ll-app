import React, { useState, useEffect } from 'react';
import { Link, json, useNavigate } from 'react-router-dom';
import './result.css';
import startIMg from '../../assests/Images/Star.svg';
import Modal from '../../components/Modal/Modal';
import axios from 'axios';
import Header from '../../components/Header';


export default function Results() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stars, setStars] = useState(0);
 const [isCalled,setIsCalled] = useState(0)
 const [wordSentence, setWordSentence] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const handlePrint = () =>{
    window.print();
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [getGap, setGetGap] = useState(null);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_host}/learner/scores/GetGaps/session/${localStorage.getItem(
        'virtualStorySessionID'
      )}`
    )
      .then(response => response.text())
      .then(async result => {
        var apiResponse = JSON.parse(result);
        setGetGap(apiResponse);

      
      });
    GetRecommendedWordsAPI();
  }, []);
  const GetRecommendedWordsAPI = () => {
    fetch(
      `${process.env.REACT_APP_host}/learner/scores/GetRecommendedWords/session/${localStorage.getItem(
        'virtualStorySessionID'
      )}`
    )
      .then(res => {
        return res.json();
      })
      .then(data => {
        setStars(data.length);
      });
  };

  const charactersArray = getGap?.map(item => item.character);

  useEffect(()=>{
    if (charactersArray?.length>0 && isCalled === 0){
      handleWordSentence();
      setIsCalled(isCalled+1)
    }
  },[charactersArray])

  const handleWordSentence = () => {
    axios
      .post(
        `${process.env.REACT_APP_host}/content-service/v1/WordSentence/search`,
        {
          tokenArr: charactersArray,
        }
      )
      .then(res => {

        setWordSentence(res.data);

        localStorage.removeItem('content_random_id');
        localStorage.setItem('content_random_id', -1);
        localStorage.setItem('pageno',1);
        let contentdata = []
         res.data.data.forEach((element, index) => {
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
      })
      .catch(error => {
        console.error(error);
      });
  };
  const characterImprove = () => {
    const charactersToImprove = getGap
      ?.filter((item) => item.score < 0.9)
      .map((item) => item.character);
    const uniqueChars = [];
    charactersToImprove?.forEach((char) => {
      if (!uniqueChars?.includes(char)) {
        uniqueChars?.push(char);
      }
    });
    return uniqueChars?.join(',');
  };
    
  const [startCount, setStartCount] = useState(0); // Initialize with 0
  const targetCount = stars; // The target visitor count
  
  useEffect(() => {
    const incrementVisitorCount = () => {
      if (startCount < targetCount) {
        setStartCount((prevCount) => prevCount + 1);
      }
    };
  
    // Set up an interval to increment the count every 1 second (adjust as needed)
    const intervalId = setInterval(incrementVisitorCount, 30);
  
    return () => {
      // Clean up the interval when the component unmounts
      clearInterval(intervalId);
    };
  }, [startCount, targetCount]);

  return (
    <>
    <Header/>
      <div className="main-bg">
        <section className="c-section">
          <div className="container1">
            <div className="row">
              <div className='col s8'>
              <Link to={'/storylist'}>
               <button className='btn btn-info'>
                   Practice another Story
              </button>
              </Link>
                <div className="bg-image">
                  <div className="content">
                    <h1>Congratulations...</h1>
                    <br />
                    <h4>Coins earned : {startCount} <img src={startIMg} alt='starsImg'/> </h4>
                    <br />
                    <button className='btn btn-success' onClick={openModal}>Share With Teachers</button>
                    <br />
                    <Link to={'/exploreandlearn/startlearn'}>
                    <button className='btn btn-info'>
                      Improve Further
                    </button>
                    </Link>

                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className='col s6'>

                <Modal isOpen={isModalOpen} onClose={closeModal}>
                  <table id="customers">
                    <tr>
                      <th><h4>Coins earned  </h4></th>
                      <th>{stars} <img src={startIMg} /> </th>
                    </tr>
                    {/* <tr>
                      <td>Recommended Sentece </td>
                      <td> {wordSentence.data?.length > 0 && wordSentence?.data.map((item, ind) => {
                        return (
                          <>
                            <p>{item?.data[0]?.hi?.text}</p>
                          </>
                        );
                      })}</td>
                    </tr> */}
                    <tr>
                      <td> Sentences Spoken</td>
                      <td>
                        <h3> {localStorage.getItem("sentenceCounter")}</h3></td>
                    </tr>
                    <tr>
                      <td>Characters To Improve </td>
                      <td>
                        <h3> {characterImprove()}</h3></td>
                    </tr>

                  </table>
                  <br />
                  <div className='row'>
                    <div className='col s12'>
                      <button className='btn btn-success' onClick={handlePrint}>Print Result</button>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
            <div>
              
            </div>
          </div>
        </section>
        <div>
        </div>
      </div>
    </>
  );
}