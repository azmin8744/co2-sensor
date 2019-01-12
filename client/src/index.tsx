import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import Concentration from './concentration/containers/container'

ReactDOM.render(
    <Provider store = {store}>
        <Concentration />
    </Provider>
    , document.getElementById('main')
)
