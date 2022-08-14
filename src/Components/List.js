/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useReducer, useRef } from 'react'
import { makeStyles } from '@material-ui/core'
import { API, graphqlOperation as operation } from 'aws-amplify'
import { createTask, updateTask } from '../graphql/mutations'
import { getUser } from '../graphql/queries'
import { groupBy, remove, cloneDeep } from 'lodash-es'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import List from '@material-ui/core/List'
import MenuItem from '@material-ui/core/MenuItem'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import SyncIcon from '@material-ui/icons/Sync'
import HelpIcon from '@material-ui/icons/Help'
import blueGrey from '@material-ui/core/colors/blueGrey'
import ListItem from './ListItem'
import Loader from './Loader'


function isExpired (expirationTime) {
  let now = Date.now()
  let expire = expirationTime - now
  return (expire <= 0)
}


function arrangeTasks (tasks) {
  let split1 = groupBy(tasks, 'complete')
  let split2 = groupBy(split1.false, item => isExpired(item.expirationTime))

  if (split2.false) {
    split2.false.sort((a, b) => a.expirationTime - b.expirationTime) //active
  }

  let splitTasks = {}
  splitTasks.active = split2.false || []
  splitTasks.complete = split1.true || []
  splitTasks.incomplete = split2.true || []

  return splitTasks
}


const useStyles = makeStyles(theme => ({
  form: {
    [theme.breakpoints.up('sm')]: { display: 'flex' }
  },
  selectPrice: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      flex: 4,
      marginLeft: theme.spacing(1)
    }
  },
  selectDay: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      flex: 5,
      marginLeft: theme.spacing(1)
    }
  },
  newTaskInput: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      flex: 9,
    }
  },
  newTask: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  list: {
    padding: theme.spacing(3)
  },
  divider: {
    margin: theme.spacing(3, 0)
  },
  why: {
    color: blueGrey[500]
  },
  button: {
    marginTop: theme.spacing(2)
  },
  taskTitle: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  dialogPaper: {
    margin: 0
  },
  about: {
    width: 30,
    height: 30,
    minHeight: 0
  }
}))


const initialState = { tasks: null }


function reducer (state, action) {
  switch (action.type) {
    case 'GET_TASKS':
      return { ...state, tasks: action.data }

    case 'ADD_TASK':
      let tasks1 = cloneDeep(state.tasks)
      tasks1.active.push(action.data)
      return { ...state, tasks: tasks1 }

    case 'COMPLETE_TASK':
      let tasks2 = cloneDeep(state.tasks)
      let completed = remove(tasks2.active, { id: action.data })[0]
      completed.complete = true
      tasks2.complete.push(completed)
      return { ...state, tasks: tasks2 }

    case 'EXPIRE_TASK':
      let tasks3 = cloneDeep(state.tasks)
      let expired = remove(tasks3.active, { id: action.data })[0]
      tasks3.incomplete.push(expired)
      return { ...state, tasks: tasks3 }

    default:
      return state
  }
}



function TodoList ({ user }) {
  const newTaskState = {
    text: '',
    price: '',
    expirationTime: ''
  }

  const c = useStyles()
  const inputLabel1 = useRef(null)
  const inputLabel2 = useRef(null)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [newTask, setNewTask] = useState(newTaskState)
  const [openDialog, setOpenDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { getTasks() }, [])


  const getTasks = () => {
    API.graphql(operation(getUser, {
      id: user.sub
    })).then(data => {
      let tasks = data.data.getUser.tasks.items

      dispatch({
        type: 'GET_TASKS',
        data: arrangeTasks(tasks)
      })
    })
  }


  const handleComplete = id => () => {
    API.graphql(operation(updateTask, { input: { id, complete: true } }))
      .then(() => {
        dispatch({
          type: 'COMPLETE_TASK',
          data: id
        })
      })
  }


  const handleExpire = id => {
    dispatch({
      type: 'EXPIRE_TASK',
      data: id
    })
  }


  const readyForSubmit = () => {
    let { text, price, expirationTime } = newTask
    return (text && price && expirationTime)
  }


  const handleSubmit = event => {
    event.preventDefault()
    if (!readyForSubmit) return
    setSubmitting(true)

    const task = {
      text: newTask.text,
      price: newTask.price,
      complete: false,
      expirationTime: Date.now() + (newTask.expirationTime * 1000 * 60 * 60 * 24),
      userTasksId: user.sub
    }

    API.graphql(operation(createTask, { input: task }))
      .then(data => {
        setNewTask(newTaskState)
        setSubmitting(false)

        task.id = data.data.createTask.id

        dispatch({
          type: 'ADD_TASK',
          data: task
        })
      })
  }


  const handleChange = event => {
    const name = event.target.name
    const value = event.target.value
    setNewTask(oldForm => ({ ...oldForm, [name]: value }))
  }


  function handleClickOpen () { setOpenDialog(true) }
  function handleClose () { setOpenDialog(false) }


  const aboutDialog = (
    <Dialog
      classes={{ paper: c.dialogPaper }}
      open={openDialog}
      onClose={handleClose}
    >
      <DialogTitle>
        Why should I pay money for a to-do list?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography className={c.why} variant='body2' gutterBottom>
            People tend to take lightly contracts they make with themselves.
            Contract is any promise you make to yourself saying 'I will do X in the
            future'.
            Since they tend to miss the emotional price they pay for doing so,
            paying a monetary price serves 3 purposes:
            <ol>
              <li>Alleviating the guilt thus reducing the emotional price.</li>
              <li>Making the price more noticeable thus pushing you to act.</li>
              <li>
                Since money is involved, you will make sure this is a task you
                really need to do, focusing on what is important.
              </li>
            </ol>
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary' autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )


  return (
    <>
      {aboutDialog}
      <div className={c.taskTitle}>
        <Typography variant='h6' gutterBottom>
          Add a new task
        </Typography>
        <Fab
          size='small'
          color='primary'
          className={c.about}
          onClick={handleClickOpen}
        >
          <HelpIcon />
        </Fab>
      </div>
      <Typography variant='body2' gutterBottom>
        Select time and a price you will pay, should you not complete the task within that time.
      </Typography>

      <form onSubmit={handleSubmit} autoComplete='off'>
        <div className={c.form}>
          <TextField
            label='What needs to be done?'
            name='text'
            className={c.newTaskInput}
            placeholder='Clean my room'
            value={newTask.text}
            onChange={handleChange}
            margin='normal'
            variant='outlined'
          />

          <FormControl
            variant='outlined'
            margin='normal'
            className={c.selectDay}
          >
            <InputLabel ref={inputLabel2} htmlFor='expirationTime'>
              Compete in
            </InputLabel>
            <Select
              value={newTask.expirationTime}
              onChange={handleChange}
              input={
                <OutlinedInput
                  labelWidth={90}
                  name='expirationTime'
                  id='expirationTime'
                />
              }
            >
              <MenuItem value={2}>2 Days</MenuItem>
              <MenuItem value={3}>3 Days</MenuItem>
              <MenuItem value={4}>4 Days</MenuItem>
              <MenuItem value={5}>5 Days</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            variant='outlined'
            margin='normal'
            className={c.selectPrice}
          >
            <InputLabel ref={inputLabel1} htmlFor='price'>
              Price
            </InputLabel>
            <Select
              value={newTask.price}
              onChange={handleChange}
              input={
                <OutlinedInput
                  labelWidth={50}
                  name='price'
                  id='price'
                />
              }
            >
              <MenuItem value={10}>$10</MenuItem>
              <MenuItem value={20}>$20</MenuItem>
              <MenuItem value={50}>$50</MenuItem>
              <MenuItem value={100}>$100</MenuItem>
              <MenuItem value={500}>$500</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button
          disabled={
            submitting ||
            !(newTask.text && newTask.price && newTask.expirationTime)
          }
          fullWidth
          className={c.button}
          type='submit'
          variant='contained'
          color='secondary'
          size='large'
        >
          Add Task
          {submitting && <SyncIcon className={c.uploadingIcon}/>}
        </Button>
      </form>

      <Divider className={c.divider}/>

      {state && state.tasks ?
        <List>
          {state.tasks.active.map((task) => (
            <ListItem
              key={task.id}
              task={task}
              handleComplete={handleComplete}
              handleExpire={handleExpire}
            />
          ))}

          <Divider className={c.divider}/>
          {state.tasks.complete.map((task) => (
            <ListItem key={task.id} task={task}/>
          ))}
          {state.tasks.incomplete.map((task) => (
            <ListItem key={task.id} task={task}/>
          ))}
        </List>
        : <Loader/>
      }
    </>
  )
}

export default TodoList