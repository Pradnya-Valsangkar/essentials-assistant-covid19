import { AsyncStorage } from 'react-native';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { persistReducer } from 'redux-persist';
import authReducer from './auth-reducer';

const rootReducer = combineReducers({
    auth: authReducer
});

const persistConfig = {
    // Root
    key: 'root',
    // Storage Method
    storage: AsyncStorage,
    // Whitelist (Save Specific Reducers)
    whitelist: [
        'auth',
    ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const configureAuthStore = () => {
    return createStore(
        persistedReducer,
        // applyMiddleware(
        //     createLogger(),
        // ),
    );
};

export default configureAuthStore;