import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import VideoAlerts from './screens/VideoAlerts';
import Chyron from './screens/Chyron';
import './App.css';

const Home = () => (
	<div>Home</div>
);

const NoMatch = () => (
	<div>Not Found</div>
);

const Alerts = () => (
	<React.Fragment>
		<Chyron />
		<VideoAlerts />
	</React.Fragment>
);

const App = () => {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/alerts" component={Alerts} />
					<Route component={NoMatch} />
				</Switch>
			</div>
		</Router>
	);
};

export default App;
