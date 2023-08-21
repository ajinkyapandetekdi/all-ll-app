import React from 'react';
import { interact,start } from '../services/telementryService';
const duration = new Date().getTime();


export const interactCall = (id, uri, currentPage, telemetryMode) => {
  interact(id, uri, currentPage, telemetryMode)
};

export const  startEvent=()=>{
 start(
    duration
  );
}