/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import {
  Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import history from '../helpers/history'
import { API, graphqlOperation as operation } from 'aws-amplify'
import { getUser } from '../graphql/queries'

import Login from './Login'
import Layout from './Layout'
import TodoList from './List'
import Page404 from './Page404'


const pages = {
  login: '/login',
  main: '/list'
}


const PrivateRoute = ({ component, user, updateUserState, ...rest }) => {
  const [tasks, setTasks] = useState(0)

  useEffect(() => {
    async function loadUser () {
      try {
        let userDb = await API.graphql(operation(getUser, {
          id: user.sub
        }))

        setTasks(userDb.data.getUser.tasks)
      } catch (error) { console.log(error) }
    }

    if (user) loadUser()
  }, [])


  return (
    <Route {...rest} render={(props) => (
      user
        ? <Layout
          component={component}
          updateUserState={updateUserState}
          user={user}
          tasks={tasks}
          updatePoints={setTasks}
          {...props}
        />
        : <Redirect to={pages.login}/>
    )}/>
  )
}



const Routes = ({ user, updateUserState }) => (
  <Router history={history}>
    <Switch>
      <Route
        exact path={'/'}
        render={() => <Redirect to={pages.main}/>}
      />
      <Route
        path={pages.login}
        render={routeProps => (
          user ?
            <Redirect to={pages.main}/> :
            <Login updateUserState={updateUserState} {...routeProps}/>
        )}
      />
      <PrivateRoute
        path={pages.main}
        user={user}
        updateUserState={updateUserState}
        component={TodoList}
      />
      <Route component={Page404}/>
    </Switch>
  </Router>
)


export default Routes
