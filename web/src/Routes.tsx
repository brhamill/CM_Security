import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { Bye } from './pages/Bye';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <header>
          <div>
            <Link to='/'>home</Link>
          </div>
          <div>
            <Link to='/register'>register</Link>
          </div>
          <div>
            <Link to='/login'>login</Link>
          </div>
          <div>
            <Link to='/bye'>bye</Link>
          </div>
        </header>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/register' component={Register} />
          <Route path='/login' component={Login} />
          <Route path='/bye' component={Bye} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
