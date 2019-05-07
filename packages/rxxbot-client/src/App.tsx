import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MessageEvent } from 'rxxbot-types';
import VideoAlerts from './screens/VideoAlerts';
import './App.css';
import {
	addMessageListener,
	removeMessageListener,
} from './services/socketIo';

const Home = () => (
	<div>Home</div>
);

const NoMatch = () => (
	<div>Not Found</div>
);

const App = () => {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/alerts" component={VideoAlerts} />
					<Route component={NoMatch} />
				</Switch>
			</div>
		</Router>
	);
};

export default App;
