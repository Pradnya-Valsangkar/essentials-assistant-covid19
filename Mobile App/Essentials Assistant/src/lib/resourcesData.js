import Config from 'react-native-config';
import {userID} from './utils'

let serverUrl = Config.STARTER_KIT_SERVER_URL;
if (serverUrl.endsWith('/')) {
  serverUrl = serverUrl.slice(0, -1)
}

export const search = (query, pos) => {
  const type = query.type ? `type=${query.type}` : '';
  let position = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };
  let positionString = JSON.stringify(position)
  const posit = position ? `position=${positionString}` : '';
  const userID = query.userID ? `userID=${query.userID}` : '';
  console.log('query name: ' + JSON.stringify(type));
  console.log('Position ' + JSON.stringify(position));

  return fetch(`${serverUrl}/covid/resources?${posit}&${type}&${userID}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};