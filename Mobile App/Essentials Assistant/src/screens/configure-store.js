import { applyMiddleware, createStore, combineReducers } from 'redux'
import { createLogger } from 'redux-logger';
import {AppointmentReducer} from './appointment-reducer'
import {VideoCallReducer} from './appointment-reducer'

const rootReducer = combineReducers({
    appointment: AppointmentReducer,
    videocall: VideoCallReducer
});
  
export default ConfigureStore = () => {

    return createStore(
        rootReducer
        //persistedReducer,
        // applyMiddleware(
        //     createLogger(),
        // ),
    )
}